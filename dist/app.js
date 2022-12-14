var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
;
;
;
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
;
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
class State {
    constructor() {
        this.listeners = [];
    }
    addListener(listenerFunction) {
        this.listeners.push(listenerFunction);
    }
    ;
}
class Component {
    constructor(templateId, hostElementId, insertAtStart, newElementId) {
        this.templateElement = document.getElementById(templateId);
        this.hostElement = document.getElementById(hostElementId);
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        if (newElementId) {
            this.element.id = newElementId;
        }
        ;
        this.attach(insertAtStart);
    }
    attach(insertAtBeginning) {
        this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element);
    }
}
class Project {
    constructor(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
;
class ProjectState extends State {
    constructor() {
        super();
        this.projects = [];
    }
    ;
    addProject(title, description, numberOfPeople) {
        const newProject = new Project(Math.random().toString(), title, description, numberOfPeople, ProjectStatus.Active);
        this.projects.push(newProject);
        this.updateListeners();
    }
    ;
    moveProject(projectId, newStatus) {
        const project = this.projects.find(project => project.id === projectId);
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListeners();
        }
        ;
    }
    ;
    updateListeners() {
        for (const listenerFunc of this.listeners) {
            listenerFunc(this.projects.slice());
        }
        ;
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        ;
        this.instance = new ProjectState();
        return this.instance;
    }
    ;
}
;
const projectState = ProjectState.getInstance();
class ProjectItem extends Component {
    constructor(hostId, project) {
        super('single-project', hostId, false, project.id);
        this.project = project;
        this.configure();
        this.renderContent();
    }
    get persons() {
        if (this.project.people === 1) {
            return '1 person';
        }
        else {
            return `${this.project.people} persons`;
        }
        ;
    }
    ;
    ;
    dragStartHandler(event) {
        event.dataTransfer.setData('text/plain', this.project.id);
        event.dataTransfer.effectAllowed = 'move';
    }
    ;
    dragEndHandler(_) {
        console.log('Drag End');
    }
    configure() {
        this.element.addEventListener('dragstart', this.dragStartHandler.bind(this));
        this.element.addEventListener('dragend', this.dragEndHandler);
    }
    ;
    renderContent() {
        this.element.querySelector('h2').textContent = this.project.title;
        this.element.querySelector('p').textContent = this.project.description;
        this.element.querySelector('h3').textContent = this.persons + ' assigned';
    }
    ;
}
class ProjectList extends Component {
    constructor(type) {
        super('project-list', 'app', false, `${type}-projects`);
        this.type = type;
        this.assignedProjects = [];
        this.configure();
        this.renderContent();
    }
    ;
    dragOverHandler(event) {
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault();
            const listEl = this.element.querySelector('ul');
            listEl.classList.add('droppable');
        }
    }
    ;
    dropHandler(event) {
        const projectId = event.dataTransfer.getData('text/plain');
        projectState.moveProject(projectId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
    }
    ;
    dragLeaveHandler(_) {
        const listEl = this.element.querySelector('ul');
        listEl.classList.remove('droppable');
    }
    ;
    configure() {
        this.element.addEventListener('dragover', this.dragOverHandler.bind(this));
        this.element.addEventListener('dragleave', this.dragLeaveHandler.bind(this));
        this.element.addEventListener('drop', this.dropHandler.bind(this));
        projectState.addListener((projects) => {
            const relevantProjects = projects.filter((project) => {
                if (this.type === 'active') {
                    return project.status === ProjectStatus.Active;
                }
                return project.status === ProjectStatus.Finished;
            });
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
    }
    renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`);
        listEl.innerHTML = '';
        for (const projectItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector('ul').id, projectItem);
        }
    }
    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul').id = listId;
        this.element.querySelector('h2').textContent = this.type.toUpperCase() + ' PROJECTS';
    }
    ;
}
class ProjectInput extends Component {
    constructor() {
        super('project-input', 'app', true, 'user-input');
        this.titleInputElement = this.element.querySelector('#title');
        this.descriptionInputElement = this.element.querySelector('#description');
        this.peopleInputElement = this.element.querySelector('#people');
        this.configure();
    }
    ;
    renderContent() { }
    ;
    configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }
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
            projectState.addProject(title, description, people);
        }
        ;
        this.clearUserInputs();
    }
    ;
}
__decorate([
    AutoBind
], ProjectInput.prototype, "submitHandler", null);
const projInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
//# sourceMappingURL=app.js.map