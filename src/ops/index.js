var xtend = require('xtend');

console.log('here');
module.exports = xtend({},
                       require('./aux'),
                       require('./control'),
                       require('./stack'),
                       require('./math')
                      );
