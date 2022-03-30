module.exports = {
  apps : [{
    script    : "app.js",
    instances : "max",
    exec_mode : "cluster"
  }]
}
