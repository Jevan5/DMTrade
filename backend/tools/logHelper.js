var logErr = function(text){
    console.log(new Date().toLocaleString() + ' ERROR: ' + text);
}

module.exports = {
    logErr: logErr
}