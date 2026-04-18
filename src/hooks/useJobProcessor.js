import { useState, useRef } from "react";
import { submitJob, getJobStatus, getJobIndex } from "../api/api";
import { createPoller } from "../utils/polling";

export function useJobProcessor() {
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const pollerRef = useRef(null);

  const start = async (file) => {
    if (!file) return;

    setLoading(true);

    try {
      const data = await submitJob(file);

      setJobId(data.job_id);
      setStatus(data.status);

      startPolling(data.job_id);
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (id) => {
    pollerRef.current = createPoller(async () => {
      try {
        const data = await getJobStatus(id);

        setStatus(data.status);
        setProgress(data.progress_pct || 0);

        if (data.status === "completed") {
          pollerRef.current.stop();
          await fetchResult(id);
        }

        if (data.status === "failed") {
          pollerRef.current.stop();
        }
      } catch (err) {
        console.error(err);
        pollerRef.current.stop();
        throw err;
      }
    });

    pollerRef.current.start();
  };

  const fetchResult = async (id) => {
    try {
      const data = await getJobIndex(id);

      if (data.zip?.url) {
        setDownloadUrl(data.zip.url);
      } else {
        console.warn("ZIP não disponível no index");
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    start,
    jobId,
    status,
    progress,
    downloadUrl,
    loading,
  };
}