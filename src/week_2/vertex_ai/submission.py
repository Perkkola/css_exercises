from google.cloud import aiplatform, storage
import gdown
import zipfile
from pathlib import Path
from urllib.parse import urlparse


def deploy(bucket_name, model_name):
        """
        Setups the bucket, deploys the Vertex AI model and endpoint for image classification.

        Args:
        -----
        bucket_name : str
                Name of the Cloud Storage bucket to create and use for model artifacts
        model_name : str
                Name to use for the model registration and deployment

        Returns:
        --------
        endpoint handler
        """
        # Your implementation here
        
        url = "https://drive.google.com/file/d/1_qrNNWWhvOMOjCVcxR0ncayY61VeIq2N/view"
        output = "/tmp/model.zip"

        gdown.download(url, output, quiet=True)

        with zipfile.ZipFile(output, 'r') as zip_ref:
                zip_ref.extractall("/tmp")

        storage_client = storage.Client(project="css-fransperkkola-2026")

        bucket = storage_client.bucket(bucket_name)
        bucket.storage_class = "STANDARD"
        new_bucket = storage_client.create_bucket(bucket, location="europe-north1", enable_object_retention=False)

        local_dir = Path("/tmp/model")

        for path in local_dir.rglob("*"):
                blob_name = f"{model_name}/{path.relative_to(local_dir).as_posix()}"
                new_bucket.blob(blob_name).upload_from_filename(str(path))

        aiplatform.init(
                project='css-fransperkkola-2026',
                location='europe-north1',
                staging_bucket=f'gs://{bucket_name}',
                )

        model = aiplatform.Model.upload(display_name=model_name,
                                        artifact_uri=f"gs://{bucket_name}/{model_name}",
                                        serving_container_image_uri="europe-docker.pkg.dev/vertex-ai/prediction/pytorch-cpu.2-4:latest")
        
        return model.deploy(machine_type="n1-highcpu-2")

def destroy(endpoint_handler):
        """
        Cleans up the Vertex AI resources by deleting the bucket, endpoint and model.

        Args:
        -----
        endpoint_handler: The endpoint handler to delete.
        """
        # Your implementation here
        model = aiplatform.Model(endpoint_handler.list_models()[0].model)
        bucket_name = urlparse(model.uri).netloc

        endpoint_handler.delete(force=True)
        model.delete()

        client = storage.Client()
        client.bucket(bucket_name).delete(force=True)

if __name__ == "__main__":
        endpoint_handler = deploy("css-fransperkkola-2026-vertex-ai", "css-fransperkkola-2026-resnet18")
        destroy(endpoint_handler)