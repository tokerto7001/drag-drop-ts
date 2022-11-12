var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const AutoBind = (_, _2, descriptor) => {
    const originalMethod = descriptor.value;
    const manipulatedDescriptor = {
        configurable: true,
        get() {
            const boundFunction = originalMethod.bind(this);
            return boundFunction;
        }
    };
    return manipulatedDescriptor;
};
const validateInputs = (objectToValidate) => {
    let isValid = true;
    if (objectToValidate.required) {
        isValid = isValid && objectToValidate.value.toString().trim().length != 0;
    }
    ;
    if (objectToValidate.minLength != null && typeof objectToValidate.value === 'string') {
        isValid = isValid && objectToValidate.value.length > objectToValidate.minLength;
    }
    ;
    if (objectToValidate.maxLength != null && typeof objectToValidate.value === 'string') {
        isValid = isValid && objectToValidate.value.length < objectToValidate.maxLength;
    }
    ;
    if (objectToValidate.min != null && typeof objectToValidate.value === 'number') {
        isValid = isValid && objectToValidate.value > objectToValidate.min;
    }
    ;
    if (objectToValidate.max != null && typeof objectToValidate.value === 'number') {
        isValid = isValid && objectToValidate.value < objectToValidate.max;
    }
    ;
    return isValid;
};
class ProjectInput {
    constructor() {
        this.templateElement = document.getElementById('project-input');
        this.hostElement = document.getElementById('app');
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = 'user-input';
        this.titleInputElement = this.element.querySelector('#title');
        this.descriptionInputElement = this.element.querySelector('#description');
        this.peopleInputElement = this.element.querySelector('#people');
        this.configure();
        this.attach();
    }
    ;
    clearUserInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }
    collectUserInput() {
        const insertedTitle = this.titleInputElement.value;
        const insertedDescription = this.descriptionInputElement.value;
        const insertedPeople = this.peopleInputElement.value;
        const titleValidateObject = {
            value: insertedTitle,
            required: true
        };
        const descriptionValidateObject = {
            value: insertedDescription,
            required: true,
            minLength: 5
        };
        const peopleValidateObject = {
            value: insertedPeople,
            required: true,
            min: 1,
            max: 5
        };
        if (!validateInputs(titleValidateObject) &&
            !validateInputs(descriptionValidateObject) &&
            !validateInputs(peopleValidateObject)) {
            alert('Invalid input, please try again!');
            return;
        }
        else {
            return [insertedTitle, insertedDescription, +insertedPeople];
        }
    }
    ;
    submitHandler(event) {
        event.preventDefault();
        const userInput = this.collectUserInput();
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            console.log(title, description, people);
        }
        ;
        this.clearUserInputs();
    }
    ;
    configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }
    attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}
__decorate([
    AutoBind
], ProjectInput.prototype, "submitHandler", null);
const projInput = new ProjectInput();
//# sourceMappingURL=app.js.map