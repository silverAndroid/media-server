/**
 * Created by silver_android on 6/5/2017.
 */
import {MdButtonModule, MdCardModule, MdToolbarModule, MdProgressSpinnerModule, MdGridListModule} from "@angular/material";
import {NgModule} from "@angular/core";

@NgModule({
    imports: [MdButtonModule, MdCardModule, MdToolbarModule, MdProgressSpinnerModule, MdGridListModule],
    exports: [MdButtonModule, MdCardModule, MdToolbarModule, MdProgressSpinnerModule, MdGridListModule]
})
export class MaterialModule {
}