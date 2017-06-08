export class Season {
    constructor(private _number: number, private _imageURL: string, private _overview: string) {
        this.imageURL = _imageURL;
    }

    get number(): number {
        return this._number;
    }

    set number(value: number) {
        this._number = value;
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
