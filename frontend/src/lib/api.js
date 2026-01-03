import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

// Attach CSRF or additional headers here later if backend adds them

// #region agent log
api.interceptors.request.use(
  (config) => {
    // #region agent log
    const cookieHeader = document.cookie;
    const cookieCount = cookieHeader ? cookieHeader.split(';').length : 0;
    const cookieSize = new Blob([cookieHeader]).size;
    const allHeadersSize = JSON.stringify(config.headers || {}).length;
    fetch('http://127.0.0.1:7243/ingest/4ed0c55e-7f6e-48e4-8a9d-849576b3d59a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:15',message:'Request headers before send',data:{url:config.url,method:config.method,cookieCount,cookieSize,allHeadersSize,cookieHeader:cookieHeader.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion agent log
    return config;
  },
  (error) => Promise.reject(error)
);
// #endregion agent log

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // #region agent log
    if (error.response?.status === 431) {
      const cookieHeader = document.cookie;
      const cookieCount = cookieHeader ? cookieHeader.split(';').length : 0;
      const cookieSize = new Blob([cookieHeader]).size;
      fetch('http://127.0.0.1:7243/ingest/4ed0c55e-7f6e-48e4-8a9d-849576b3d59a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.js:30',message:'431 error detected',data:{url:error.config?.url,method:error.config?.method,cookieCount,cookieSize,cookieHeader:cookieHeader.substring(0,500)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
    // #endregion agent log
    // Centralized error handling hook
    if (error.response?.status === 401) {
      // Optionally trigger a global sign-out or redirect
    }
    return Promise.reject(error);
  }
);

export default api;


