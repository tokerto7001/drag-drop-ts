class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement;

    constructor() {
        // template element for the form
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        // div element to display the templates inside it
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        // import the content of the template element
        const importedNode = document.importNode(this.templateElement.content, true);
        // fetches the form element from the imported node which is a template element as a first element child
        this.element = importedNode.firstElementChild as HTMLFormElement;
        // inserts the selected element into hostElement which is the div with an id of app
        this.attach();
    };

    // inserts an element inside hostElement
    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}

const projInput = new ProjectInput();