class CalcController{ 

    constructor(){
        // Inicializa variáveis e configurações da calculadora
        this._audio = new Audio('click.mp3'); // Áudio para os cliques
        this._audioOnOff = false; // Estado do áudio
        this._lastOperator = ''; // Último operador usado
        this._lastNumber = ''; // Último número digitado
        this._operation = []; // Operações realizadas
        this._locale = 'pt-BR'; // Localização para data e hora
        this._displayCalcEl = document.querySelector("#display"); // Elemento para exibir o cálculo
        this._dateEl = document.querySelector("#data"); // Elemento para exibir a data
        this._timeEl = document.querySelector("#hora"); // Elemento para exibir a hora
        this._currentDate; // Data atual
        this.initialize(); // Método que inicializa a calculadora
        this.initButtonsEvents(); // Método que inicializa os eventos dos botões
        this.initKeyboard(); // Método que inicializa o teclado
    }

    // Método para colar valor da área de transferência
    pasteFromClipboard(){
        document.addEventListener('paste', e=>{
            let text = e.clipboardData.getData('Text');
            this.displayCalc = parseFloat(text); // Define o valor no display
        });
    }

    // Método para copiar o valor da calculadora para a área de transferência
    copyToClipboard(){
        let input = document.createElement('input');
        input.value = this.displayCalc;
        document.body.appendChild(input);
        input.select();
        document.execCommand("Copy");
        input.remove();
    }

    // Método que inicializa a data e hora, além de outros componentes
    initialize(){
        this.setDisplayDateTime();
        setInterval(()=>{ // Atualiza a data e hora a cada segundo
            this.setDisplayDateTime();
        }, 1000);
        this.setLastNumberToDisplay(); // Atualiza o último número no display
        this.pasteFromClipboard(); // Habilita a funcionalidade de colar
        // Adiciona evento de duplo clique para ativar/desativar o áudio
        document.querySelectorAll('.btn-ac').forEach(btn=>{
            btn.addEventListener('dblclick', e=>{
                this.toggleAudio();
                this.playAudio();
            });
        });
    }

    // Método que alterna o estado do áudio (ligado/desligado)
    toggleAudio(){
        this._audioOnOff = !this._audioOnOff;
    }

    // Método que reproduz o som quando o áudio está ativado
    playAudio(){
        if(this._audioOnOff){
            this._audio.currentTime = 0;
            this._audio.play();
        }
    }

    // Método que inicializa os eventos do teclado (captura as teclas pressionadas)
    initKeyboard(){
        document.addEventListener('keyup', e=>{
            this.playAudio();
            switch (e.key){
                case 'Escape':
                    this.clearAll(); // Limpa tudo
                    break;
                case 'Backspace':
                    this.clearEntry(); // Limpa última entrada
                    break;
                case '+':
                case '-':
                case '/':
                case '*':
                case '%':
                    this.addOperation(e.key); // Adiciona operador
                    break;
                case 'Enter':
                case '=':
                    this.calc(); // Calcula o resultado
                    break;
                case '.':
                case ',':
                    this.addDot("."); // Adiciona ponto decimal
                    break;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key)); // Adiciona número
                    break;
                case 'c':
                    if(e.ctrlKey) this.copyToClipboard(); // Copia para a área de transferência
                    break;
            }
        });
    }

    // Método para adicionar múltiplos eventos a um elemento
    addEventListenerAll(element, events, fn){
        events.split(' ').forEach(event =>{
            element.addEventListener(event, fn, false);
        });
    }

    // Método que limpa todas as operações e configura o display para 0
    clearAll(){
        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';
        this.setLastNumberToDisplay(); // Atualiza o display
    }

    // Método que limpa a última operação
    clearEntry(){
        this._operation.pop(); // Remove a última operação
        this.setLastNumberToDisplay(); // Atualiza o display
    }

    // Método que retorna a última operação realizada
    getLastOperation(){
        return this._operation[this._operation.length-1];
    }

    // Método que define o valor da última operação
    setLastOperation(value){
        this._operation[this._operation.length-1] = value;
    }

    // Método que verifica se o valor é um operador
    isOperator(value){
        return (['+', '-', '*', '/', '%'].indexOf(value) > -1);
    }

    // Método que adiciona uma nova operação
    pushOperation(value){
        this._operation.push(value);
        if(this._operation.length > 3){
            this.calc(); // Calcula quando há mais de 3 elementos
        }
    }

    // Método que retorna o resultado da operação
    getResult(){
        try{
            return eval(this._operation.join('')); // Avalia a operação
        } catch(e){
            setTimeout(()=>{
                this.setError(); // Caso ocorra erro, exibe erro no display
            }, 1);
        }
    }

    // Método que calcula o resultado baseado nas operações realizadas
    calc(){
        let last = '';
        this._lastOperator = this.getLastItem(true); // Pega o último operador
        if(this._operation.length < 3){ // Caso tenha menos de 3 elementos, completa a operação
            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];
        }
        if(this._operation.length > 3){ // Se houver mais de 3 elementos, faz o cálculo
            last = this._operation.pop();
            this._lastNumber = this.getResult();
        }
        else if(this._operation.length == 3){
            this._lastNumber = this.getLastItem(false); // Pega o último número
        }

        let result = this.getResult();
        if (last == '%'){ // Se o operador for '%', divide por 100
            result /= 100;
            this._operation = [result];
        } else {
            this._operation = [result];
            if(last) this._operation.push(last); // Se houver um operador final, adiciona-o
        }
        this.setLastNumberToDisplay(); // Atualiza o display com o resultado
    }

    // Método que pega o último item (número ou operador)
    getLastItem(isOperator = true){
        let lastItem;
        for(let i = this._operation.length-1; i >= 0; i--){
            if (this.isOperator(this._operation[i]) == isOperator){
                lastItem = this._operation[i];
                break;
            }
        }
        if(!lastItem){
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
        }
        return lastItem;
    }

    // Método que atualiza o display com o último número
    setLastNumberToDisplay(){
        let lastNumber = this.getLastItem(false);
        if(!lastNumber) lastNumber = 0;
        this.displayCalc = lastNumber;
    }

    // Método que adiciona uma operação (número ou operador)
    addOperation(value){
        if (isNaN(this.getLastOperation())){ // Se o último valor não for número
            if(this.isOperator(value)){
                this.setLastOperation(value); // Atualiza o operador
            } else{
                this.pushOperation(value); // Adiciona nova operação
                this.setLastNumberToDisplay(); // Atualiza display
            }
        } else {
            if (this.isOperator(value)){
                this.pushOperation(value); // Adiciona operador
            } else{
                let newValue = this.getLastOperation().toString() + value.toString(); // Concatena o valor
                this.setLastOperation(newValue);
                this.setLastNumberToDisplay(); // Atualiza o display
            }
        }
    }

    // Método que exibe "Error" no display caso algo dê errado
    setError(){
        this.displayCalc = "Error";
    }

    // Método que adiciona ponto decimal
    addDot(){
        let lastOperation = this.getLastOperation();
        if(typeof lastOperation == 'string' && lastOperation.split('').indexOf('.') > -1) return; // Se já houver um ponto, não adiciona outro
        if(this.isOperator(lastOperation) || !lastOperation){
            this.pushOperation('0.'); // Adiciona 0 antes do ponto
        }else {
            this.setLastOperation(lastOperation.toString() + '.'); // Adiciona ponto ao número
        }
        this.setLastNumberToDisplay(); // Atualiza o display
    }

    // Método que executa a ação correspondente ao botão clicado
    execBtn(value) {
        this.playAudio();
        switch (value){
            case 'ac':
                this.clearAll();
                break;
            case 'ce':
                this.clearEntry();
                break;
            case 'soma':
                this.addOperation('+');
                break;
            case 'subtracao':
                this.addOperation('-');
                break;
            case 'divisao':
                this.addOperation('/');
                break;
            case 'multiplicacao':
                this.addOperation('*');
                break;
            case 'porcento':
                this.addOperation('%');
                break;
            case 'igual':
                this.calc();
                break;
            case 'ponto':
                this.addDot(".");
                break;
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;
            default:
                this.setError();
                break;
        }
    }

    // Método que inicializa os eventos dos botões
    initButtonsEvents(){
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");
        buttons.forEach((btn, index)=>{
            this.addEventListenerAll(btn, "click drag", e=>{
                let textBtn = btn.className.baseVal.replace("btn-", "");
                this.execBtn(textBtn); // Executa a ação do botão
            });
            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e=>{
                btn.style.cursor = "pointer"; // Altera o cursor ao passar o mouse
            });
        });
    }

    // Método que atualiza a data e hora no display
    setDisplayDateTime(){
        this._currentDate = new Date();  // Atualize a data para garantir que a hora e a data estejam corretas
        this.displayDate = this.currentDate.toLocaleDateString(this._locale); // Formata a data
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale); // Formata a hora
    }

    // Getters e setters para os displays de data, hora e cálculo

    get displayTime(){
        return this._timeEl.innerHTML;
    }

    set displayTime(value){
        this._timeEl.innerHTML = value;
    }

    get displayDate(){
        return this._dateEl.innerHTML;
    }

    set displayDate(value){
        this._dateEl.innerHTML = value;
    }

    get displayCalc(){
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(value){
        if(value.toString().length > 10){
            this.setError(); // Se o valor for muito grande, exibe erro
            return false;
        }
        this._displayCalcEl.innerHTML = value; // Exibe o valor no display
    }

    get currentDate(){
        return new Date();
    }

    set currentDate(value){
        this._currentDate = value;
    }
}
