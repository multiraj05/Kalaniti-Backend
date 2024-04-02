module.exports = () => {
  return (req, res, next) => {
    const token = req.body.key || req.query.key || req.headers.key;
    if (token) {
      if (token == process.env.SECRET_KEY) {
        console.log("----done---");
        next();
      } else {
        console.log("-------------");
        return res.status(401).json({ error: "Unauthorized access" });
      }
    } else {
      console.log("-------------");
      return res.status(401).json({ error: "Unauthorized access" });
    }
  };
};