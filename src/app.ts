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

    // handler of the form submission
    private submitHandler(event: Event) {
        event.preventDefault();
        console.log(this.titleInputElement.value)
    }
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