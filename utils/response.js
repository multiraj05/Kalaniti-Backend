exports.response = (res, statusCode, data) => {
    if (statusCode === 200) {
      return res.status(statusCode).json({ status: true, ...data });
    } else if (statusCode === 201) {
      return res.status(200).json({ status: false, ...data });
    }else if (statusCode === 401) {
      return res.status(statusCode).json({ status: false, ...data });
    } else if (statusCode === 403) {
      return res.status(statusCode).json({ status: false, ...data });
    } else if (statusCode === 500) {
      return res.status(statusCode).json({ status: false, error: data.message || "Internal Server Error !" });
    } else {
      return res.status(statusCode).json({ status: false, ...data });
    }
  }