// TYPES AND INTERFACES
interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
};

interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
};
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
type Listener<T> = (items: T[]) => void;

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

class State<T>{
    protected listeners: Listener<T>[] = [];

    addListener(listenerFunction: Listener<T>) {
        this.listeners.push(listenerFunction);
    };
}

abstract class Component<T extends HTMLElement, U extends HTMLElement>{
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string) {
        // template element for the form
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        // div element to display the templates inside it
        this.hostElement = document.getElementById(hostElementId)! as T;
        // imported node and element definition
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as U;
        if (newElementId) {
            this.element.id = newElementId;
        };

        this.attach(insertAtStart);
    }

    // inserts an element inside hostElement
    private attach(insertAtBeginning: boolean) {
        this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element);
    }

    abstract configure(): void;
    abstract renderContent(): void;
}
class Project {
    constructor(public id: string, public title: string, public description: string, public people: number, public status: ProjectStatus) {

    }
};
class ProjectState extends State<Project>{
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
        super();
    };

    addProject(title: string, description: string, numberOfPeople: number) {
        const newProject = new Project(Math.random().toString(), title, description, numberOfPeople, ProjectStatus.Active)
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

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement>
    implements Draggable {
    private project: Project;

    get persons() {
        if (this.project.people === 1) {
            return '1 person';
        } else {
            return `${this.project.people} persons`;
        };
    };

    constructor(hostId: string, project: Project) {
        super('single-project', hostId, false, project.id);
        this.project = project;
        this.configure();
        this.renderContent();
    };

    dragStartHandler(event: DragEvent): void {
        console.log(event);
    };

    dragEndHandler(_: DragEvent): void {
        console.log('Drag End')
    }

    configure() {
        this.element.addEventListener('dragstart', this.dragStartHandler.bind(this));
        this.element.addEventListener('dragend', this.dragEndHandler);
    };

    renderContent() {
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('p')!.textContent = this.project.description;
        this.element.querySelector('h3')!.textContent = this.persons + ' assigned';
    };
}
class ProjectList extends Component<HTMLDivElement, HTMLElement>{
    assignedProjects: Project[];

    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', false, `${type}-projects`)

        this.assignedProjects = [];

        this.configure();
        this.renderContent();
    };

    configure(): void {
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
    }

    // render the projects on every adding
    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        // empties the inner HTML to prevent duplicate values
        listEl.innerHTML = '';
        for (const projectItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector('ul').id, projectItem);
        }
    }
    // render the content according to its type
    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    };

}
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super('project-input', 'app', true, 'user-input');

        // fetches the input elements from the form element
        this.titleInputElement = this.element.querySelector('#title')! as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description')! as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people')! as HTMLInputElement;

        // adds the submit event to the form element
        this.configure();

    };
    renderContent(): void { };

    // add event listeners to the form element
    configure() {
        // it is crucial to bind the method with the class in order to reach the class object
        // this.element.addEventListener('submit', this.submitHandler.bind(this))
        this.element.addEventListener('submit', this.submitHandler); // binding is done via @AutoBind decorator
    }
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
}

const projInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');