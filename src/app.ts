// DECORATORS
// binds the method automatically to the class so there will be no need for manual binding
const AutoBind = (_: any, _2: string, descriptor: PropertyDescriptor) => { // if you don't use the parameters, just use _ instead or just enable them in the tsconfig file
    // gets the method
    const originalMethod = descriptor.value;
    // creates a new property descriptor to bind the method
    const manipulatedDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            // binds the original method
            const boundFunction = originalMethod.bind(this);
            return boundFunction;
        }
    };
    // returns the new manipulated descriptor of the method
    return manipulatedDescriptor;
}

class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        // template element for the form
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        // div element to display the templates inside it
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        // import the content of the template element
        const importedNode = document.importNode(this.templateElement.content, true);

        // fetches the form element from the imported node which is a template element as a first element child
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = 'user-input'

        // fetches the input elements from the form element
        this.titleInputElement = this.element.querySelector('#title')! as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description')! as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people')! as HTMLInputElement;

        // adds the submit event to the form element
        this.configure();
        // inserts the selected element into hostElement which is the div with an id of app
        this.attach();
    };

    //  clears the user inputs
    private clearUserInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    // returns tuple type which will return string, string  and number identifying the input results
    private collectUserInput(): [string, string, number] | void {
        const insertedTitle = this.titleInputElement.value;
        const insertedDescription = this.descriptionInputElement.value;
        const insertedPeople = this.peopleInputElement.value;
        // input value validation
        if (!insertedTitle.trim().length || !insertedDescription.trim().length || !insertedPeople.trim().length) {
            alert('Invalid input, please try again!');
            return;
        } else {
            // returns the input values
            return [insertedTitle, insertedDescription, +insertedPeople];
        }
    };

    // handler of the form submission
    @AutoBind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.collectUserInput();
        if (Array.isArray(userInput)) { // although tuples are not recognized by JS, they are arrays at the end of the day
            const [title, description, people] = userInput;
            console.log(title, description, people);
        };
        this.clearUserInputs();
    };

    // add event listeners to the form element
    private configure() {
        // it is crucial to bind the method with the class in order to reach the class object
        this.element.addEventListener('submit', this.submitHandler.bind(this))
    }

    // inserts an element inside hostElement
    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}

const projInput = new ProjectInput();