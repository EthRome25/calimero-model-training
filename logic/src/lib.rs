#![allow(clippy::len_without_is_empty)]


use calimero_sdk::app;
use calimero_sdk::borsh::{BorshDeserialize, BorshSerialize};
use calimero_sdk::serde::Serialize;
use calimero_storage::collections::UnorderedMap;
use calimero_storage::env;
use thiserror::Error;

#[app::state(emits = for<'a> Event<'a>)]
#[derive(Debug, BorshSerialize, BorshDeserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
pub struct MedicalFileStore {
    // Shared ML models (P2P accessible)
    shared_models: UnorderedMap<String, ModelFile>,
    // Local MRI scans (node-specific storage)
    local_scans: UnorderedMap<String, ScanFile>,
    // File metadata and access logs
    file_metadata: UnorderedMap<String, FileMetadata>,
}

#[derive(Debug, BorshSerialize, BorshDeserialize, Serialize)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct ModelFile {
    pub id: String,
    pub name: String,
    pub description: String,
    pub model_type: String, // e.g., "tumor_classifier", "segmentation", "detection"
    pub version: String,
    pub file_size: u64,
    pub file_data: String, // Base64 encoded model data
    pub uploader: String,
    pub created_at: u64,
    pub is_public: bool,
}

#[derive(Debug, BorshSerialize, BorshDeserialize, Serialize)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct ScanFile {
    pub id: String,
    pub patient_id: String,
    pub scan_type: String, // e.g., "MRI", "CT", "PET"
    pub body_part: String, // e.g., "brain", "chest", "abdomen"
    pub file_size: u64,
    pub file_data: String, // Base64 encoded scan data
    pub uploader: String,
    pub created_at: u64,
    pub annotation_count: u32,
}

#[derive(Debug, BorshSerialize, BorshDeserialize, Serialize)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct FileMetadata {
    pub file_id: String,
    pub file_type: String, // "model" or "scan"
    pub access_count: u32,
    pub last_accessed: u64,
    pub tags: Vec<String>,
}

#[app::event]
pub enum Event<'a> {
    ModelUploaded { model_id: &'a str, name: &'a str },
    ScanUploaded { scan_id: &'a str, patient_id: &'a str },
    ModelDownloaded { model_id: &'a str, downloader: &'a str },
    ScanDownloaded { scan_id: &'a str, downloader: &'a str },
    AnnotationAdded { scan_id: &'a str, annotation_id: &'a str },
    FileDeleted { file_id: &'a str, file_type: &'a str },
}

#[derive(Debug, Error, Serialize)]
#[serde(crate = "calimero_sdk::serde")]
#[serde(tag = "kind", content = "data")]
pub enum Error<'a> {
    #[error("file not found: {0}")]
    FileNotFound(&'a str),
    #[error("invalid file type: {0}")]
    InvalidFileType(&'a str),
    #[error("file too large: {0} bytes")]
    FileTooLarge(u64),
    #[error("unauthorized access to file: {0}")]
    Unauthorized(&'a str),
    #[error("invalid annotation data")]
    InvalidAnnotation,
}

#[app::logic]
impl MedicalFileStore {
    #[app::init]
    pub fn init() -> MedicalFileStore {
        MedicalFileStore {
            shared_models: UnorderedMap::new(),
            local_scans: UnorderedMap::new(),
            file_metadata: UnorderedMap::new(),
        }
    }

    // Model management methods
    pub fn upload_model(
        &mut self,
        name: String,
        description: String,
        model_type: String,
        version: String,
        file_data: String,
        uploader: String,
        is_public: bool,
    ) -> app::Result<String> {
        let model_id = format!("model_{}", env::time_now());
        let file_size = file_data.len() as u64;
        
        // Check file size limit (10MB for models)
        if file_size > 10 * 1024 * 1024 {
            app::bail!(Error::FileTooLarge(file_size));
        }

        let model = ModelFile {
            id: model_id.clone(),
            name: name.clone(),
            description,
            model_type,
            version,
            file_size,
            file_data,
            uploader: uploader.clone(),
            created_at: env::time_now(),
            is_public,
        };

        self.shared_models.insert(model_id.clone(), model)?;
        
        // Create metadata
        let metadata = FileMetadata {
            file_id: model_id.clone(),
            file_type: "model".to_string(),
            access_count: 0,
            last_accessed: env::time_now(),
            tags: vec![],
        };
        self.file_metadata.insert(model_id.clone(), metadata)?;

        app::emit!(Event::ModelUploaded {
            model_id: &model_id,
            name: &name,
        });

        Ok(model_id)
    }

    pub fn get_model(&self, model_id: &str) -> app::Result<Option<ModelFile>> {
        app::log!("Getting model: {:?}", model_id);
        self.shared_models.get(model_id).map_err(Into::into)
    }

    pub fn get_public_models(&self) -> app::Result<Vec<ModelFile>> {
        app::log!("Getting all public models");
        
        let models: Vec<ModelFile> = self.shared_models
            .entries()?
            .filter(|(_, model)| model.is_public)
            .map(|(_, model)| model)
            .collect();
            
        Ok(models)
    }

    pub fn download_model(&mut self, model_id: &str, downloader: String) -> app::Result<ModelFile> {
        let model = self.shared_models.get(model_id)?
            .ok_or_else(|| Error::FileNotFound(model_id))?;

        // Update access metadata
        if let Some(mut metadata) = self.file_metadata.get(model_id)? {
            metadata.access_count += 1;
            metadata.last_accessed = env::time_now();
            self.file_metadata.insert(model_id.to_string(), metadata)?;
        }

        app::emit!(Event::ModelDownloaded {
            model_id,
            downloader: &downloader,
        });

        Ok(model)
    }

    // Scan management methods
    pub fn upload_scan(
        &mut self,
        patient_id: String,
        scan_type: String,
        body_part: String,
        file_data: String,
        uploader: String,
    ) -> app::Result<String> {
        let scan_id = format!("scan_{}", env::time_now());
        let file_size = file_data.len() as u64;
        
        // Check file size limit (50MB for scans)
        if file_size > 50 * 1024 * 1024 {
            app::bail!(Error::FileTooLarge(file_size));
        }

        let scan = ScanFile {
            id: scan_id.clone(),
            patient_id: patient_id.clone(),
            scan_type,
            body_part,
            file_size,
            file_data,
            uploader: uploader.clone(),
            created_at: env::time_now(),
            annotation_count: 0,
        };

        self.local_scans.insert(scan_id.clone(), scan)?;
        
        // Create metadata
        let metadata = FileMetadata {
            file_id: scan_id.clone(),
            file_type: "scan".to_string(),
            access_count: 0,
            last_accessed: env::time_now(),
            tags: vec![],
        };
        self.file_metadata.insert(scan_id.clone(), metadata)?;

        app::emit!(Event::ScanUploaded {
            scan_id: &scan_id,
            patient_id: &patient_id,
        });

        Ok(scan_id)
    }

    pub fn get_scan(&self, scan_id: &str) -> app::Result<Option<ScanFile>> {
        app::log!("Getting scan: {:?}", scan_id);
        self.local_scans.get(scan_id).map_err(Into::into)
    }

    pub fn get_scans_by_patient(&self, patient_id: &str) -> app::Result<Vec<ScanFile>> {
        app::log!("Getting scans for patient: {:?}", patient_id);
        
        let scans: Vec<ScanFile> = self.local_scans
            .entries()?
            .filter(|(_, scan)| scan.patient_id == patient_id)
            .map(|(_, scan)| scan)
            .collect();
            
        Ok(scans)
    }

    pub fn download_scan(&mut self, scan_id: &str, downloader: String) -> app::Result<ScanFile> {
        let scan = self.local_scans.get(scan_id)?
            .ok_or_else(|| Error::FileNotFound(scan_id))?;

        // Update access metadata
        if let Some(mut metadata) = self.file_metadata.get(scan_id)? {
            metadata.access_count += 1;
            metadata.last_accessed = env::time_now();
            self.file_metadata.insert(scan_id.to_string(), metadata)?;
        }

        app::emit!(Event::ScanDownloaded {
            scan_id,
            downloader: &downloader,
        });

        Ok(scan)
    }

    // Annotation methods
    pub fn add_annotation(
        &mut self,
        scan_id: &str,
        _label: String,
    ) -> app::Result<String> {
        let annotation_id = format!("annotation_{}", env::time_now());

        let mut scan = self.local_scans.get(scan_id)?
            .ok_or_else(|| Error::FileNotFound(scan_id))?;
            
        scan.annotation_count += 1;
        self.local_scans.insert(scan_id.to_string(), scan)?;

        app::emit!(Event::AnnotationAdded {
            scan_id,
            annotation_id: &annotation_id,
        });

        Ok(annotation_id)
    }

    // Utility methods
    pub fn get_file_metadata(&self, file_id: &str) -> app::Result<Option<FileMetadata>> {
        self.file_metadata.get(file_id).map_err(Into::into)
    }

    pub fn get_all_metadata(&self) -> app::Result<Vec<FileMetadata>> {
        Ok(self.file_metadata.entries()?.map(|(_, metadata)| metadata).collect())
    }

    pub fn delete_file(&mut self, file_id: &str, file_type: &str) -> app::Result<()> {
        match file_type {
            "model" => {
                self.shared_models.remove(file_id)?;
            }
            "scan" => {
                self.local_scans.remove(file_id)?;
            }
            _ => {
                app::bail!(Error::InvalidFileType(file_type));
            }
        }

        self.file_metadata.remove(file_id)?;

        app::emit!(Event::FileDeleted {
            file_id,
            file_type,
        });

        Ok(())
    }

    pub fn get_stats(&self) -> app::Result<String> {
        let model_count = self.shared_models.len()?;
        let scan_count = self.local_scans.len()?;
        let total_files = model_count + scan_count;
        
        let stats = format!(
            "Total files: {}, Models: {}, Scans: {}",
            total_files, model_count, scan_count
        );
        
        Ok(stats)
    }
}
