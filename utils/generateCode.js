exports.generateId = (count) => {
    const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let hexID = "";
  
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      hexID += characters[randomIndex];
    }
  
    return hexID;
  }
  
  exports.uniqueId = (length) => {
    return parseInt(Math.ceil(Math.random() * Date.now()).toPrecision(length).toString().replace(".", ""))
  }