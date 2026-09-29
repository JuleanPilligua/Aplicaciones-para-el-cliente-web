document.getElementById('formulario').addEventListener('submit', function (e) {
    e.preventDefault();
    calculadora();
});

function calculadora() {
    let num1 = parseFloat(document.getElementById('num1').value);
    let num2 = parseFloat(document.getElementById('num2').value);

    if (isNaN(num1) || isNaN(num2)) {
        alert("Por favor, ingresa números válidos.");
        return;
    }

    for (let i = 0; i < 5; i++) {
        let resultado;
        let muestra;

        switch (i) {
            case 0:
                resultado = num1 + num2;
                muestra = `El resultado de la suma es ${resultado}`;
                break;
            case 1:
                resultado = num1 - num2;
                muestra = `El resultado de la resta es ${resultado}`;
                break;
            case 2:
                resultado = num1 * num2;
                muestra = `El resultado de la multiplicación es ${resultado}`;
                break;
            case 3:
                resultado = num2 !== 0 ? num1 / num2 : 'Indefinido (división por cero)';
                muestra = `El resultado de la división es ${resultado}`;
                break;
            case 4:
                resultado = num2 !== 0 ? num1 % num2 : 'Indefinido (módulo por cero)';
                muestra = `El resultado del módulo es ${resultado}`;
                break;
        }

        alert(muestra);
    }
}