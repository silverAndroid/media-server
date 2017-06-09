export class Show {
    constructor(private _name: string, private _imageURL: string, private _overview: string, private _id?: number) {
        this.imageURL = _imageURL;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get imageURL(): string {
        return this._imageURL;
    }

    set imageURL(value: string) {
        this._imageURL = `https://image.tmdb.org/t/p/w500${value}`;
    }

    get overview(): string {
        return this._overview;
    }

    set overview(value: string) {
        this._overview = value;
    }
}
