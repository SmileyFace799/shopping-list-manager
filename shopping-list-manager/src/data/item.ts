export interface Item {
    name: string;
    checked: boolean;
}

export interface List {
    name: string;
    filename: string;
    items: Item[];
}