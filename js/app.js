let client  = {
    table:'',
    hour:'',
    order: []
};
let categories = {
    1: 'comida',
    2: 'bebida',
    3: 'postre'
}

const btnSaveClient = document.querySelector('#save-client');
btnSaveClient.addEventListener('click', saveClient);

function saveClient(){
    const table = document.querySelector('#table');
    const hour = document.querySelector('#hour');

    /* VALIDATING THERE ARE NO EMPTY FIELDS */
    const emptyField = [table.value, hour.value].some( field => field === '' );

    if(emptyField){
        
        /* VALIDATING THERE ARE NO ALERTS */
        const existAlert = document.querySelector('.invalid-feedback');

        if(existAlert){
            return;
        }else{
            const alert = document.createElement('div');
            alert.classList.add('invalid-feedback', 'text-center', 'd-block');
            alert.textContent = 'All fields are required';
            document.querySelector('.modal-body form').appendChild(alert);
        }
    }else{
        client = { ...client, table: table.value, hour: hour.value };
        const form = document.getElementById('form');
        const bootstrapModal = bootstrap.Modal.getInstance(form);
        bootstrapModal.hide();
        showHiddenSections();
    }
};

function showHiddenSections(){
    const hiddenSection = document.querySelectorAll('.d-none');
    hiddenSection.forEach(section => section.classList.remove('d-none') )
    getDishes();
}

function getDishes(){
    const url = 'http://localhost:4000/platillos';
    
    fetch(url)
    .then(response => response.json())
    .then(data => showDishInfo(data))
    .catch(error => console.log(error));
}

function showDishInfo(dishes){
    const dishInfo = document.querySelector('.dish-container');

    dishes.forEach(dish => {
        const row = document.createElement('div');
        row.classList.add('row', 'py-3', 'border-top');
        
        const name = document.createElement('div');
        name.classList.add('col-md-4');
        name.textContent = dish.nombre;
        row.appendChild(name);
        
        const price = document.createElement('div');
        price.classList.add('col-md-3', 'fw-bold');
        price.textContent = dish.precio;
        row.appendChild(price);
        
        const category = document.createElement('div');
        category.classList.add('col-md-3');
        category.textContent = categories[dish.categoria];
        row.appendChild(category);
        
        const quantityInput = document.createElement('input');
        quantityInput.type = "number";
        quantityInput.min = 0;
        quantityInput.id = `product-${dish.id}`;
        quantityInput.value = 0;
        quantityInput.classList.add('col-md-2' ,'text-center');
        quantityInput.onchange = () => {
            const quantity = quantityInput.value;
            addDishes({...dish, quantity})
        }
        row.appendChild(quantityInput);
        
        dishInfo.appendChild(row);
    });
}

function addDishes(plate) {
    const { order } = client;
    console.log(order);

    if(plate.quantity > 0){
        client.order = [...order, plate];
        console.log(order.some(element => element.id === plate.id));
    }else{
        console.log(`plate ${plate.nombre} quantity: ${plate.quantity}`);
    }
}