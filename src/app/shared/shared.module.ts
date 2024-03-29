import { NgModule } from '@angular/core';
import { CalendarBlockComponent } from './components/calendar-block/calendar-block.component';
import { CalendarDayComponent } from './components/calendar-day/calendar-day.component';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { DaySheduleRowComponent } from './components/day-shedule-row/day-shedule-row.component';
import { CalendarDayOfWeekPipe } from './pipes/calendar-day-of-week.pipe';
import { TimeRowPipe } from './pipes/time-row.pipe';
import { OurSpecialistsComponent } from './components/our-specialists/our-specialists.component';
import { SpecialistCardComponent } from './components/specialist-card/specialist-card.component';
import { SpecialistFilterPipe } from './pipes/specialist-filter.pipe';
import { RouterModule } from '@angular/router';
import { NavHomeComponent } from './components/nav-home/nav-home.component';
import { ProfileNavComponent } from '../profile/shared/components/profile-nav/profile-nav.component';
import { LessonsViewPipe } from './pipes/lessons-view.pipe';
import { NameRowPipe } from './pipes/name-row.pipe';
import { SpecializationsListPipe } from './pipes/specializations-list.pipe';
import { FbSecurityPopupComponent } from './components/fb-security-popup/fb-security-popup.component';
import { TextCutterPipe } from './pipes/text-cutter.pipe';
import { EventDetailsPopupComponent } from './components/event-details-popup/event-details-popup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RequisitesPopupComponent } from './components/requisites-popup/requisites-popup.component';
import { ImgPopupComponent } from './components/popups/img-popup/img-popup.component';
import { AppointmentDetailsPopupComponent } from './components/popups/appointment-details-popup/appointment-details-popup.component';
import { TimeCheckPipe } from './pipes/time-check.pipe';
import { ManualOrderPopupComponent } from './components/popups/manual-order-popup/manual-order-popup.component';
// import { AngularFireModule } from '@angular/fire';
// import { AngularFireAuthModule } from '@angular/fire/auth';
// import { AngularFireFunctionsModule } from '@angular/fire/functions';


// import { FaqNewComponent } from './components/faq-new/faq-new.component';



@NgModule({
   imports: [
      CommonModule,
      RouterModule,
      FormsModule,
      ReactiveFormsModule 
   ],
   exports: [
      CommonModule,
      CalendarBlockComponent,
      CalendarDayComponent,
      DaySheduleRowComponent,
      OurSpecialistsComponent,
      SpecialistCardComponent,
      ProfileNavComponent,
      ImgPopupComponent,
      // RouterModule
      SpecializationsListPipe,
      EventDetailsPopupComponent,
      TextCutterPipe,
   ],
   declarations: [
      CalendarBlockComponent,
      CalendarDayComponent,
      DaySheduleRowComponent,
      OurSpecialistsComponent,
      SpecialistCardComponent,
      ProfileNavComponent,
      // DaySheduleRowComponent,
      CalendarDayOfWeekPipe,
      TimeRowPipe,
      SpecialistFilterPipe,
      LessonsViewPipe,
      NameRowPipe,
      ImgPopupComponent,
      SpecializationsListPipe,
      TextCutterPipe,
      EventDetailsPopupComponent,
      AppointmentDetailsPopupComponent,
      TimeCheckPipe,
      ManualOrderPopupComponent,
      
      
      
      // FaqNewComponent,
      // FbSecurityPopupComponent,
   ],
   providers: [],
})
export class SharedModule { }
