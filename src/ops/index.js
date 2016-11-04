var xtend = require('xtend');

module.exports = xtend({},
                       require('./aux'),
                       require('./control'),
                       require('./stack'),
                       require('./math')
                      );
