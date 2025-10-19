#![allow(clippy::len_without_is_empty)]

use calimero_sdk::app;
use calimero_sdk::borsh::{BorshDeserialize, BorshSerialize};
use calimero_sdk::serde::Serialize;
use calimero_storage::env;
use std::option::Option;

// Single application state containing the current model only
#[app::state]
#[derive(Debug, BorshSerialize, BorshDeserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
pub struct AppState {
    model: Option<Model>,
}

#[derive(Debug, BorshSerialize, BorshDeserialize, Serialize, Clone)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct Model {
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
    pub prediction_accuracy: f32,
    pub model_params: String,
    // Optional metadata associated with the current model
    // pub current_model_metadata: Option<ModelMetadata>
}

// Additional metadata describing the current model
#[derive(Debug, BorshSerialize, BorshDeserialize, Serialize, Clone)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct ModelMetadata {
    // Overall prediction accuracy (e.g., between 0.0 and 1.0)
    pub prediction_accuracy: u8,
    // Unix timestamp (seconds) when the model was produced/uploaded
    pub date: u64,
    // Free-form model parameters (can be JSON string or similar)
    pub model_params: String,
}

#[app::logic]
impl AppState {
    #[app::init]
    pub fn init() -> AppState {
        AppState { model: None }
    }

    // Upload and set the current model. Accepts raw binary data and separate metadata.
    pub fn upload_current_model(
        &mut self,
        name: String,
        description: String,
        model_type: String,
        version: String,
        // Raw model bytes; will be stored as Base64 inside ModelFile to keep structure backward-compatible
        //@TODO (Warning) Currently calimero is limited with the max message size
        file_bytes_base64: String,
        uploader: String,
        // Metadata
        prediction_accuracy: f32,
        date: u64,
        model_params: String,
        // Visibility flag retained from existing ModelFile structure
        is_public: bool,
    ) -> app::Result<String> {
        // Convert binary to Base64 to fit current ModelFile definition
        let file_size = file_bytes_base64.len() as u64;

        let model_id = format!("model:{}:{}", name, version);
        let created_at = env::time_now();

        let model = Model {
            id: model_id.clone(),
            name,
            description,
            model_type,
            version,
            file_data: file_bytes_base64,
            file_size,
            uploader,
            created_at,
            is_public,
            prediction_accuracy,
            model_params,
        };

        self.model = Some(model);

        Ok(model_id)
    }

    // Returns the metadata for the current model, if any.
    // pub fn get_current_model_metadata(&self) -> app::Result<Option<ModelMetadata>> {
    //     Ok(self.model.as_ref().unwrap().current_model_metadata.clone())
    // }

    // Returns the current model, if any.
    pub fn get_current_model(&self) -> app::Result<Option<Model>> {
        Ok(self.model.clone())
    }
}
