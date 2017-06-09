import {Component, Input, OnInit} from "@angular/core";
import {Show} from "../show";

@Component({
    selector: 'show',
    templateUrl: './show.component.html',
    styleUrls: ['./show.component.css']
})
export class ShowComponent implements OnInit {

    @Input('data')
    show: Show;
    @Input()
    expanded: boolean;
    overviewClass;
    imgStyle;

    constructor() {
    }

    ngOnInit() {
        if (this.expanded) {
            this.overviewClass = '';
            this.imgStyle = {width: '100px', margin: '0 16px 0 0', float: 'left'};
        }
        else {
            this.overviewClass = 'overview';
            this.imgStyle = {};
        }
    }

}
