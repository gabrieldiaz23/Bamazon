var mysql = require("mysql");
var inquirer = require("inquirer");
var tab = require("console.table");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "fourloko",
  database: "bamazon"
});

connection.connect(function(err) {
    if (err) 
        throw err;
    start();
});

function start() {
    console.log('----------------------------------------------------------------------------------------------');
    console.log('-------------------------------------WELCOME TO BAMAZON!--------------------------------------');
    console.log('----------------------------------------------------------------------------------------------\n');
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        const table = tab.getTable(res);
        console.log(table);
        options();
    });        
};

function options() {
    inquirer.prompt({
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [
            "Buy a product",
            "View low inventory (Only for Bamazon managers)",
            "Add to inventory (Only for Bamazon managers)",
            "Add a new product (Only for Bamazon managers)"
        ]
    }).then(function (answer) {
        switch (answer.action) {
            case "Buy a product":
                buyProd();
                break;
            case "View low inventory (Only for Bamazon managers)":
                viewInventory();
                break;
            case "Add to inventory (Only for Bamazon managers)":
                addInventory();
                break;
            case "Add a new product (Only for Bamazon managers)":
                addProd();
                break;
        }
    });
}

function buyProd() {
    inquirer.prompt([{
        name: "item",
        type: "input",
        message: "What's the ID of the product you'd like to buy?:"
    },
    {
        name: "qty",
        type: "input",
        message: "How many pieces you want to buy?:"
    }]).then(function (answer) {
        var query = "SELECT * FROM products WHERE ?";
        connection.query(query, { item_id: answer.item }, function (err, res) {
            //console.log(answer.product);
            //console.log(res[0].product_name);
            console.log("\n\nYou will buy " + answer.qty + " pieces of the " + res[0].product_name);
            //console.log(res[0].stock_qty + parseInt(answer.qty));
            var total = res[0].price * answer.qty;      
            if (res[0].stock_qty >= parseInt(answer.qty)) {
                var newStock = res[0].stock_qty- answer.qty;
                var q= "UPDATE products SET ? WHERE ?";
                connection.query(q, [{stock_qty: newStock}, {item_id:answer.item}], function(err, res) {
                    console.log("\nOrder completed! Your total is: " + total + "\n\n\n");
                    options();
                });
            }
            else {
                console.log("\n\nSorry! There is not enough stock for the product you want to buy\n\n\n");
                options();
            }
        });
    });
}

function viewInventory() {
    console.log('----------------------------------------------------------------------------------------------');
    console.log('-------------------------Here are the products with low inventory-----------------------------');
    console.log('----------------------(Considering low inventory lower than 5 pieces)-------------------------');
    console.log('----------------------------------------------------------------------------------------------');
    var query = "SELECT * FROM products WHERE stock_qty < 5";
    connection.query(query, function (err, res) {
        const lowStock = tab.getTable(res);
        console.log(lowStock);
        options();
    });
}

function addInventory() {
    inquirer.prompt([{
        name: "item",
        type: "input",
        message: "Please enter the ID of the product on inventory:"
    },
    {
        name: "qty",
        type: "input",
        message: "How many pieces will be added to the inventory?:"
    }]).then(function (answer) {
        var query = "UPDATE products SET ? WHERE ?";
        connection.query(query, [{ stock_qty: answer.qty }, { item_id: answer.item }], function (err, res) {
            console.log("\nSuccess! This product has now " + answer.qty + " pieces on inventory.\n\n\n");
            options();
        });
    });
}

function addProd() {
    inquirer.prompt([{
        name: "item",
        type: "input",
        message: "Please enter the ID of the product:"
    },
    {
        name: "name",
        type: "input",
        message: "Please enter the name of the product:"
    },
    {
        name: "dept",
        type: "input",
        message: "Please enter the department related to the product:"
    },
    {
        name: "price",
        type: "input",
        message: "Please enter the price of the product:"
    },
    {
        name: "stock",
        type: "input",
        message: "Please enter how many pieces will there be on inventory:"
    }]).then(function (answer) {
        var query = "INSERT INTO products VALUES ?";
        connection.query(query, 
            [{ item_id: answer.item }, 
             { product_name: answer.name },
             { department_name: answer.dept },
             { price: answer.price },
             { stock_qty: answer.stock }
            ], function (err, res) {
            console.log("\nSuccess! The product " + answer.name + " has been added to the database.\n\n");
            options();
        });
    });
}