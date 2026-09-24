export function paginate(items, params = {}) {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Number(params.limit) || 20);
  const start = (page - 1) * limit;

  return {
    items: items.slice(start, start + limit),
    pagination: { page, limit, total: items.length },
  };
}

export function mockError(code, message, status = 409) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  return Promise.reject(error);
}

export function mockDelay(value, milliseconds = 120) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), milliseconds);
  });
}
