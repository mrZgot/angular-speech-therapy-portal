import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserData } from 'src/app/profile/shared/services/user-data.service';

@Component({
  selector: 'app-calendar-day',
  templateUrl: './calendar-day.component.html',
  styleUrls: ['./calendar-day.component.sass']
})
export class CalendarDayComponent implements OnInit {


  @Input() todayDay: any; //сегодняшнее число
  @Input() month: any; //месяц на календаре
  @Input() currentMonth: any; //текущий месяц
  @Input() year: any; //год на календаре
  @Input() currentYear: any; //текущий год
  @Input() dayIndex: any; //номер дня (1-31)
  @Input() currentFirstDay: any; //день недели начала месяца (1-7)
  @Input() selectedDay: number;
  @Input() doctorShedule: object;
  @Input() daysOfWeekShedule: object;
  @Input() scheduleHours: object;
  @Input() scheduleHoursInput: object;
  @Input() doctorsLessons: object;
  @Input() isCalendarPage: object;
  @Output() outDay = new EventEmitter<any>();
  
  thisDayOfWeek: number //день недели для каждого дня 0-6
  daySent = false

  constructor(
    public userData: UserData
  ) { }
  
  
  ngOnInit(): void {
    if (this.dayIndex == 1) {
      this.setMargin()
      this.launchListenersForFirstDay()
    }
    this.launchListenersForAllDays() //обработчики при переключении месяцев
    this.setThisDayOfWeek()
  }

  testDay() {
    console.log(this.isCalendarPage, this.userData.myData.userType == 'client', this.scheduleHoursInput[this.year][this.month][this.dayIndex], )
  }


  setThisDayOfWeek() { 
    this.thisDayOfWeek = (this.currentFirstDay + this.dayIndex - 1)%7 //номер первого дня недели (1-7) + номер дня (1-31) -1 %7
    if (this.thisDayOfWeek == 0) {
      this.thisDayOfWeek = 7
    }
    --this.thisDayOfWeek //чтобы Пн=0 Вс=6
  }

  setDayOfWeek() { //высчитать день недели для каждого дня месяца
    let currentDayOfWeek = this.currentFirstDay
    
    return currentDayOfWeek
  }

  setMargin() {
    (<HTMLElement>document.querySelector(".day")).style.marginLeft = `calc(${(this.currentFirstDay - 1)*100}% / 7 + 2px)`
  }

  outputDay() {
    // this.outDay.emit(this.thisDayOfWeek)
    // this.daySent = true
  }
  
  launchListenersForFirstDay() {
    document.getElementById("prev-month-arrow").addEventListener("click", () => {
      this.setMargin();
      
    })
    document.getElementById("next-month-arrow").addEventListener("click", () => {
      this.setMargin();
      // this.setThisDayOfWeek();
    })
  }
  
  launchListenersForAllDays() {
    document.getElementById("prev-month-arrow").addEventListener("click", () => {
      this.setThisDayOfWeek();
    });
    document.getElementById("next-month-arrow").addEventListener("click", () => {
      this.setThisDayOfWeek();
    });

  }



  

}
