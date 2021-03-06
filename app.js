//Budget Controller
var budgetController = (function(){
    
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

   var data = {
       allItems: {
           exp: [],
           inc: []
       },
       totals: {
           exp: 0,
           inc: 0
       },
       budget: 0,
       percentage: -1
   }

   var calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach(function(cur){
        sum+= cur.value;
    });
    data.totals[type] = sum;
   };

   return{
       addItem: function(type, des, val){
        var newItem, ID;

        //ID = 0;
        //Create new ID
        if(data.allItems[type].length > 0){
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
        }else{
            ID = 0;
        }
         

        //Create new Item based on type
        if(type === 'exp'){
            newItem = new Expense(ID, des, val);
        }else if(type === 'inc'){
            newItem = new Income(ID, des, val);
        }

        //Push it into data struture
        data.allItems[type].push(newItem);

        //Return    
        return newItem;

       },

       deleteItem: function(type, id){
        var index, ids;
        ids =  data.allItems[type].map(function(current){
            return current.id;
        });

        index = ids.indexOf(id);

        if(index !== -1){
            data.allItems[type].splice(index, 1);
        }

       },

       calculateBudget: function(){
         // Calculate the total income/expenses
            calculateTotal('exp');
            calculateTotal('inc');
         
         // Budget

         data.budget = data.totals.inc - data.totals.exp;

         //Percentage of income used
         if(data.totals.inc > 0){
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
         }else{
             data.percentage = -1;
         }
             

       },

       getBudget: function(){
        return{
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage
        };
       },

       testing: function(){
            console.log(data);
       }
   };

    })();
    
    //UI Controller
    var UIController = (function(){
        
        var domStrings = {
            inputType: '.add__type',
            inputDescription: '.add__description',
            inputValue: '.add__value',
            inputBtn: '.add__btn',
            incomeContainer: '.income__list',
            expensesContainer: '.expenses__list',
            budgetLabel: '.budget__value',
            incomeLabel: '.budget__income--value',
            expensesLabel: '.budget__expenses--value',
            percentageLabel: '.budget__expenses--percentage',
            container: '.container'
        }
    
        return{
            getInput: function(){
                return{
                type: document.querySelector(domStrings.inputType).value, // Either inc or exp
                description: document.querySelector(domStrings.inputDescription).value,
                value: parseFloat(document.querySelector(domStrings.inputValue).value)
                };
            },

            addListItem: function(obj, type){
                var html, newHtml,element;
                //Create HTML with placeholder string
                if(type === 'inc'){
                    element = domStrings.incomeContainer;
                    html =  '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';       
                }else if(type === 'exp'){
                    element = domStrings.expensesContainer;
                    html =  '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div></div>';
                }
                //Replace placeholder

                newHtml = html.replace('%id%', obj.id);
                newHtml = newHtml.replace('%description%', obj.description);
                newHtml = newHtml.replace('%value%',obj.value);


                //Insert HTML into the DOM
                document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);


            },

            deleteListItem: function(selectorID){
                var el;
                el = document.getElementById(selectorID);
                el.parentNode.removeChild(el);

            },

            clearFields: function(){
                var fields, fieldsArray;
                fields =  document.querySelectorAll(domStrings.inputDescription + ', ' + domStrings.inputValue);

                fieldsArray = Array.prototype.slice.call(fields);

                fieldsArray.forEach(function(current, index, array){
                    current.value = '';
                });

                fieldsArray[0].focus();
            },

            getDomStrings: function(){
                return domStrings;
            },

            displayBudget: function(obj){
                document.querySelector(domStrings.budgetLabel).textContent = obj.budget;
                document.querySelector(domStrings.incomeLabel).textContent = obj.totalInc;
                document.querySelector(domStrings.expensesLabel).textContent = obj.totalExp;
                

                if(obj.percentage > 0){
                    document.querySelector(domStrings.percentageLabel).textContent = obj.percentage + '%';
                }else{
                    document.querySelector(domStrings.percentageLabel).textContent = '---';
                }
            }
        };
    
    })();
    
    //Global App Controller
    var controller = (function(budgetCtrl, UICtrl){
    
        var setupEventListners = function(){
            
            var DOM = UICtrl.getDomStrings();
            document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
    
            document.addEventListener('keypress', function(event){
                if(event.keyCode === 13 || event.which === 13){
                    ctrlAddItem();
                }
            });

            document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        }
    
        var updateBudget = function(){
             //calculate the budget
            
             budgetCtrl.calculateBudget();

             //return the budget

             var budget = budgetCtrl.getBudget();

            //display the budget on the UI
            UICtrl.displayBudget(budget);
        };

        var ctrlAddItem = function(){
            var input, newItem;
             //Get the filled input data
             input = UICtrl.getInput();

             if(input.description !=="" && !isNaN(input.value) && input.value > 0){
                //Add the item to budget controller
             newItem =  budgetCtrl.addItem(input.type, input.description, input.value)

             //Add the new item to user interface
             UICtrl.addListItem(newItem, input.type);
 
             //Clear the Fields
             UICtrl.clearFields();
 
             //Calculate and update budget
             updateBudget(); 
             }

            
           
        };

        var ctrlDeleteItem = function(event){
            var itemId, splitID, type, ID;
            itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
            if(itemId){
                //inc-1
                splitID = itemId.split('-');
                type = splitID[0];
                ID = parseInt(splitID[1]);

                //Delete the item from the data structure
                budgetCtrl.deleteItem(type,ID);

                //Delete the item from the UI
                UICtrl.deleteListItem(itemId);

                //Update and show new budget
                updateBudget();
                
            }
        };
    
        return{
            init: function(){
                console.log('Application has started');
                UICtrl.displayBudget({
                    budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: -1
                });
                setupEventListners();
            }
        }
    
    })(budgetController, UIController);
    
    controller.init();  