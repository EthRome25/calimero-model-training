#![allow(clippy::len_without_is_empty)]

use calimero_sdk::app;
use calimero_sdk::borsh::{BorshDeserialize, BorshSerialize};
use calimero_sdk::serde::Serialize;
use calimero_storage::env;

// Single application state containing the current model only
#[app::state]
#[derive(Debug, BorshSerialize, BorshDeserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
pub struct State {
    // Holds the current model if uploaded (encoded to binary file structure)
    pub current_model: Option<ModelFile>,
    // Optional metadata associated with the current model
    pub current_model_metadata: Option<ModelMetadata>,
}

#[derive(Debug, BorshSerialize, BorshDeserialize, Serialize, Clone)]
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

// Additional metadata describing the current model
#[derive(Debug, BorshSerialize, BorshDeserialize, Serialize, Clone)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct ModelMetadata {
    // Overall prediction accuracy (e.g., between 0.0 and 1.0)
    pub prediction_accuracy: f32,
    // Unix timestamp (seconds) when the model was produced/uploaded
    pub date: u64,
    // Free-form model parameters (can be JSON string or similar)
    pub model_params: String,
}

#[app::logic]
impl State {
    #[app::init]
    pub fn init() -> State {
        State {
            current_model: None,
            current_model_metadata: None,
        }
    }

    // Upload and set the current model. Accepts raw binary data and separate metadata.
    pub fn upload_current_model(
        &mut self,
        name: String,
        description: String,
        model_type: String,
        version: String,
        // Raw model bytes; will be stored as Base64 inside ModelFile to keep structure backward-compatible
        file_bytes: Vec<u8>,
        uploader: String,
        // Metadata
        prediction_accuracy: f32,
        date: u64,
        model_params: String,
        // Visibility flag retained from existing ModelFile structure
        is_public: bool,
    ) -> app::Result<String> {
        // Convert binary to Base64 to fit current ModelFile definition
        let file_data = base64::encode(&file_bytes);
        let file_size = file_bytes.len() as u64;

        let model_id = format!("model:{}:{}", name, version);
        let created_at = env::time_now();

        let model = ModelFile {
            id: model_id.clone(),
            name,
            description,
            model_type,
            version,
            file_size,
            file_data,
            uploader,
            created_at,
            is_public,
        };

        self.current_model = Some(model);
        self.current_model_metadata = Some(ModelMetadata {
            prediction_accuracy,
            date,
            model_params,
        });

        Ok(model_id)
    }

    // Returns the metadata for the current model, if any.
    pub fn get_current_model_metadata(&self) -> app::Result<Option<ModelMetadata>> {
        Ok(self.current_model_metadata.clone())
    }

    // Convenience: return the current model (without bytes decoding)
    pub fn get_current_model(&self) -> app::Result<Option<ModelFile>> {
        Ok(self.current_model.clone())
    }
}
