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

    dishes.forEach(dish => { // DISPLAYING DISHES INFORMATION
        const row = document.createElement('div');
        row.classList.add('row', 'py-3', 'border-top');
        
        const name = document.createElement('div');
        name.classList.add('col-md-4');
        name.textContent = dish.name;
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

    if(plate.quantity > 0){
        client.order = [...order, plate];

        if(order.some(element => element.id === plate.id)){ // IF THE PLATE ALREADY EXISTS WE JUST UPDATE ITS QUANTITY

            const orderUpdated = order.map( articleUpdated => {
                if(articleUpdated.id === plate.id) articleUpdated.quantity = plate.quantity

                return articleUpdated;
            });

            client.order = [...orderUpdated]

        } else client.order = [...order, plate]
    }else{
        const result = order.filter(singleOrder => singleOrder.id !== plate.id);
        client.order = [...result];
    }

    // UPDATING SUMMARY
    const content = document.querySelector('#summary .contenido');
    cleanSummary(content);

    if(client.order.length) {
        showSummary(content);
        showTip(content);
    }
    else resetSummary(content);
}

function cleanSummary(content){     while(content.firstChild) content.removeChild(content.firstChild);     }

function showSummary(content){
    const summary = document.createElement('div');
    summary.classList.add('col-md-6', 'card', 'py-5', 'px-3', 'shadow');

    // HEADING
    const heading = document.createElement('h3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = "Client's order";
    summary.appendChild(heading);

    // TABLE
    const table = document.createElement('p');
    table.classList.add('fw-bold');
    table.textContent = 'Table: ';
    summary.appendChild(table);

    const tableSpan = document.createElement('span');
    tableSpan.classList.add('fw-normal');
    tableSpan.textContent = client.table;
    table.appendChild(tableSpan);

    // HOUR
    const hour = document.createElement('p');
    hour.classList.add('fw-bold');
    hour.textContent = 'Hour: ';
    summary.appendChild(hour);

    const hourSpan = document.createElement('span');
    hourSpan.classList.add('fw-normal');
    hourSpan.textContent = client.hour;
    hour.appendChild(hourSpan);

    // DISH INFORMATION
    const group = document.createElement('ul');
    group.classList.add('list-group');

    client.order.forEach(dish =>{
        const {id, name, price, quantity}  = dish;
        
        const list = document.createElement('li');
        list.classList.add('list-group-item');
        
        // NAME
        const nameEl = document.createElement('h4');
        nameEl.classList.add('my-4');
        nameEl.textContent = name;
        list.appendChild(nameEl);
        
        // QUANTITY
        const quantityEl = document.createElement('p');
        quantityEl.classList.add('fw-bold');
        quantityEl.textContent = 'Quantity: ';
        list.appendChild(quantityEl);

        const quantityValue = document.createElement('span');
        quantityValue.classList.add('fw-normal');
        quantityValue.textContent = quantity;
        quantityEl.appendChild(quantityValue);

        // PRICE
        const priceEl = document.createElement('p');
        priceEl.classList.add('fw-bold');
        priceEl.textContent = 'Price: ';
        list.appendChild(priceEl);

        const priceValue = document.createElement('span');
        priceValue.classList.add('fw-normal');
        priceValue.textContent = price;
        priceEl.appendChild(priceValue);

        // SUBTOTAL
        const subtotalEl = document.createElement('p');
        subtotalEl.classList.add('fw-bold');
        subtotalEl.textContent = 'Subtotal: ';
        list.appendChild(subtotalEl);

        const subtotalValue = document.createElement('span');
        subtotalValue.classList.add('fw-normal');
        subtotalValue.textContent = subtotalCalculation(quantity, price);
        subtotalEl.appendChild(subtotalValue);

        // DELETE BUTTON
        const btnDelete =  document.createElement('button');
        btnDelete.classList.add('btn', 'btn-danger');
        btnDelete.textContent = 'Delete dish';
        btnDelete.onclick = () => {     deleteDish(id)     };
        list.appendChild(btnDelete);

        group.appendChild(list);
        summary.appendChild(group);
    });

    content.appendChild(summary);
}

function subtotalCalculation(a, b){     return a * b;     }

function deleteDish(id){
    const { order } = client;
    const result = order.filter(orderUpdated => orderUpdated.id !== id);
    client.order = [...result]

    const content = document.querySelector('#summary .contenido');
    cleanSummary(content);

    if(client.order.length) {
        showSummary(content);
        showTip(content);
    }
    else resetSummary(content);

    const inputId = `#product-${id}`;
    const resetInput = document.querySelector(inputId);
    resetInput.value = 0;
}

function resetSummary(summary) {
    const paragraph = document.createElement('p');

    paragraph.classList.add('text-center');
    paragraph.textContent = 'Add order elements';
    summary.appendChild(paragraph);
}

function showTip(summary){
    const form = document.createElement('div');
    form.classList.add('col-md-6', 'ownForm');
    summary.appendChild(form);

    // HEADING
    const heading = document.createElement('h3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Tips';

    // RADIO BUTTON 10
    const radio10 = document.createElement('input');
    radio10.classList.add('form-check-input');
    radio10.type = 'radio';
    radio10.name = 'tip';
    radio10.value = '0.1';
    radio10.onclick = calculateTip;

    const radio10Label = document.createElement('label');
    radio10Label.classList.add('form-check-label');
    radio10Label.textContent = '10%';
    
    const radio10Div = document.createElement('div');
    radio10Div.classList.add('form-check');
    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);
    
    // RADIO BUTTON 25
    const radio25 = document.createElement('input');
    radio25.classList.add('form-check-input');
    radio25.type = 'radio';
    radio25.name = 'tip';
    radio25.value = '0.25';
    radio25.onclick = calculateTip;

    const radio25Label = document.createElement('label');
    radio25Label.classList.add('form-check-label');
    radio25Label.textContent = '25%';
    
    const radio25Div = document.createElement('div');
    radio25Div.classList.add('form-check');
    radio25Div.appendChild(radio25);
    radio25Div.appendChild(radio25Label);

    // RADIO BUTTON 50
    const radio50 = document.createElement('input');
    radio50.classList.add('form-check-input');
    radio50.type = 'radio';
    radio50.name = 'tip';
    radio50.value = '0.5';
    radio50.onclick = calculateTip;

    const radio50Label = document.createElement('label');
    radio50Label.classList.add('form-check-label');
    radio50Label.textContent = '50%';
    
    const radio50Div = document.createElement('div');
    radio50Div.classList.add('form-check');
    radio50Div.appendChild(radio50);
    radio50Div.appendChild(radio50Label);
    
    // FORM DIV (LOOKS BETTER)
    const divForm = document.createElement('div');
    divForm.classList.add('card', 'py-5', 'px-3', 'shadow');
    divForm.appendChild(heading);
    divForm.appendChild(radio10Div);
    divForm.appendChild(radio25Div);
    divForm.appendChild(radio50Div);

    form.appendChild(divForm);
}

function calculateTip(){
    const tip = document.querySelector("[name='tip']:checked").value;
    const { order } = client;
    let total = 0;
    let subtotal = 0;
    
    order.forEach( dish => subtotal += subtotalCalculation(Number(dish.price), Number(dish.quantity)) );

    total = (subtotal * tip) + subtotal;
    
    showTipNumbers(total, subtotal, tip);
}

function showTipNumbers(total, subtotal, tip){
    const totalsDiv = document.createElement('div');
    totalsDiv.classList.add('total-pay', 'my-4');

    // SUBTOTAL
    const subtotalParagraph = document.createElement('p');
    subtotalParagraph.classList.add('fs-3', 'fw-bold', 'mt-3');
    subtotalParagraph.textContent = 'Subtotal: '
    totalsDiv.appendChild(subtotalParagraph);
    
    const subtotalSpan = document.createElement('span');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `$${subtotal}`;
    subtotalParagraph.appendChild(subtotalSpan);

    // TIP
    const tipParagraph = document.createElement('p');
    tipParagraph.classList.add('fs-3', 'fw-bold', 'mt-3');
    tipParagraph.textContent = 'Tip: '
    totalsDiv.appendChild(tipParagraph);
    
    const tipSpan = document.createElement('span');
    tipSpan.classList.add('fw-normal');
    tipSpan.textContent = `$${tip * subtotal}`;
    tipParagraph.appendChild(tipSpan);

    // TOTAL
    const totalParagraph = document.createElement('p');
    totalParagraph.classList.add('fs-3', 'fw-bold', 'mt-3');
    totalParagraph.textContent = 'Total: '
    totalsDiv.appendChild(totalParagraph);
    
    const totalSpan = document.createElement('span');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${total}`;
    totalParagraph.appendChild(totalSpan);

    const totalPayDiv = document.querySelector('.total-pay');
    if(totalPayDiv) totalPayDiv.remove();

    const ownFormDiv = document.querySelector('.ownForm > div');
    ownFormDiv.appendChild(totalsDiv);
}