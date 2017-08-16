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
// results.setParent returns a promise, so we need need to explicitly return 
// results.setParent(current) 
Task.prototype.addChild = function (fields) {
   let current = this
    return Task.create(fields)
    .then((results) => {
      return results.setParent(current);
    })
    .catch(console.err)
}


//same as your code but I cleaned it up a little
Task.prototype.getChildren = function() {
  let current = this
  return Task.findAll({ 
    where: {
       parentId: current.id
    }
  })
  .catch(console.err)
  
}

// You can use $ne to get only tasks that have an id that does not match
// the current tasks id
Task.prototype.getSiblings = function(){
  return Task.findAll({
    where: {
      parentId: this.parentId,
      id: {
        $ne: this.id
      }
    }
  })
}

//hook
Task.beforeDestroy(function(page) {

  let children = page.getChildren();
  if (children){
    children.forEach((elem) => {
      elem.destroy()
    })
  }
})

//---------^^^---------  your code above  ---------^^^----------

Task.belongsTo(Task, {as: 'parent'});

module.exports = Task;

