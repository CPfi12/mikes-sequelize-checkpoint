'use strict';

var db = require('./database');
var Sequelize = require('sequelize');

// Make sure you have `postgres` running!

//---------VVVV---------  your code below  ---------VVV----------

var Task = db.define('Task', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  complete: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  due: Sequelize.DATE
  }, {
    getterMethods: {
      timeRemaining(){
        if (!this.due){
          return Infinity
        } else {
          return this.due - new Date().getTime() //due - current time in ms
        }
      },
      overdue() {
        if (this.timeRemaining < 0 && !this.complete){
          return true
        } else {
          //all other cases, such as date in future,
          //past due but complete, or simply complete
          return false
        }
      }
    }
  }
);

// class methods
Task.clearCompleted = () => {
  return Task.destroy({
    where: {
      complete: true
    }
  })
  .catch((err) => {
    console.log(err)
  })
}

Task.completeAll = () => {
  return Task.update({ complete: 'true' }, {
    where: {
      complete: false
    }
  })
  .catch((err) => {
    console.log(err)
  })
}


//instance methods
// Task.prototype.addChild = (fields) => {

//   return Task.create(fields)
//     .then((results) => {
//       // console.log(results.parentId)
//       return results.setParent(this);
//       // return results
//     })
//     .catch((err) => {
//       console.log(err)
//     })
//     // .then((results) => {
//     //   // console.log(results)
//     //   return results
//     // })
// }

Task.prototype.addChild = function (fields) {
    return Task.create(fields)
    .then((results) => {
      results.setParent(this)
      return results
    })
    .catch((err) => {
      console.log(err)
    })
}



//---------^^^---------  your code above  ---------^^^----------

Task.belongsTo(Task, {as: 'parent'});

module.exports = Task;

