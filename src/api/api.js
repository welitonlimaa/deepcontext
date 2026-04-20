const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;


const headers = {
  "x-api-key": API_KEY,
};

export async function submitJob(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/jobs/submit`, {
    method: "POST",
    body: formData,
    headers,
  });

  if (!res.ok) {
    let data = null;

    try {
      data = await res.json();
    } catch {
    }

    const error = new Error(
      data?.detail || "Erro ao enviar arquivo"
    );

    error.response = {
      status: res.status,
      data,
    };

    error.status = res.status;

    throw error;
  }

  return res.json();
}

export async function getJobStatus(jobId) {
  const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    headers,
  });

  if (!res.ok) throw new Error("Erro ao buscar status");

  return res.json();
}

export async function getJobIndex(jobId) {
  const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/index`, {
    headers,
  });

  if (!res.ok) throw new Error("Erro ao buscar resultado");

  return res.json();
}