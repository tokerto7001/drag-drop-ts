// TYPES AND INTERFACES
interface ObjectToValidate {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
};
enum ProjectStatus {
    Active,
    Finished
};
type Listener = (items: Project[]) => void;

//

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
};
//

// FUNCTIONS
// validates the inputs
const validateInputs = (objectToValidate: ObjectToValidate): boolean => {
    let isValid = true;
    // required validation
    if (objectToValidate.required) {
        isValid = isValid && objectToValidate.value.toString().trim().length != 0;
    };
    // minLength validation
    if (objectToValidate.minLength != null && typeof objectToValidate.value === 'string') {
        isValid = isValid && objectToValidate.value.length > objectToValidate.minLength;
    };
    // maxLength validation
    if (objectToValidate.maxLength != null && typeof objectToValidate.value === 'string') {
        isValid = isValid && objectToValidate.value.length < objectToValidate.maxLength;
    };
    // min validation
    if (objectToValidate.min != null && typeof objectToValidate.value === 'number') {
        isValid = isValid && objectToValidate.value > objectToValidate.min;
    };
    // max validation
    if (objectToValidate.max != null && typeof objectToValidate.value === 'number') {
        isValid = isValid && objectToValidate.value < objectToValidate.max;
    };
    return isValid;
};

// CLASSES

class Project {
    constructor(public id: string, public title: string, public description: string, public people: number, public status: ProjectStatus) {

    }
};
class ProjectState {
    private listeners: Listener[] = [];
    private projects: Project[] = [];
    private static instance: ProjectState;

    addListener(listenerFunction: Listener) {
        this.listeners.push(listenerFunction);
    };

    addProject(title: string, description: string, numberOfPeople: number) {
        const newProject = new Project(Math.random.toString(), title, description, numberOfPeople, ProjectStatus.Active)
        this.projects.push(newProject);
        for (const listenerFunc of this.listeners) {
            listenerFunc(this.projects.slice());
        }
    };

    static getInstance() {
        if (this.instance) {
            return this.instance;
        };
        this.instance = new ProjectState();
        return this.instance;
    };
};

// need only 1 state management object
const projectState = ProjectState.getInstance();
class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLElement;
    assignedProjects: Project[];

    constructor(private type: 'active' | 'finished') {
        // list template
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
        // app div
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        this.assignedProjects = [];

        // imported node and element definition
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLElement;
        // dynamic id according to the type of the project
        this.element.id = `${this.type}-projects`;

        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter((project) => {
                if (this.type === 'active') {
                    return project.status === ProjectStatus.Active;
                }
                return project.status === ProjectStatus.Finished;
            })
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        })

        // insert into DOM
        this.attach();
        this.renderContent();
    };

    // render the projects on every adding
    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        // empties the inner HTML to prevent duplicate values
        listEl.innerHTML = '';
        for (const projectItem of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = projectItem.title;
            listEl.appendChild(listItem);
        }
    }
    // render the content according to its type
    private renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    };

    // inserts the project into DOM
    private attach() {
        // right before the closing tag of the div with the id of app
        this.hostElement.insertAdjacentElement('beforeend', this.element);
    };
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

        // construct objectToValidates
        const titleValidateObject: ObjectToValidate = {
            value: insertedTitle,
            required: true
        };
        const descriptionValidateObject: ObjectToValidate = {
            value: insertedDescription,
            required: true,
            minLength: 5
        };
        const peopleValidateObject: ObjectToValidate = {
            value: insertedPeople,
            required: true,
            min: 1,
            max: 5
        };

        // input value validation
        if (
            !validateInputs(titleValidateObject) &&
            !validateInputs(descriptionValidateObject) &&
            !validateInputs(peopleValidateObject)
        ) {
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
            projectState.addProject(title, description, people);
        };
        this.clearUserInputs();
    };

    // add event listeners to the form element
    private configure() {
        // it is crucial to bind the method with the class in order to reach the class object
        // this.element.addEventListener('submit', this.submitHandler.bind(this))
        this.element.addEventListener('submit', this.submitHandler); // binding is done via @AutoBind decorator
    }

    // inserts an element inside hostElement
    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}

const projInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');