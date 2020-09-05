import { Component, OnInit, Input } from '@angular/core';
import { log } from 'console';
import { UserDoctor } from '../../interfaces';
import { FirebaseService } from '../../services/firebase.service';
import { PopupService } from '../../services/popup.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserData } from 'src/app/profile/shared/services/user-data.service';

@Component({
  selector: 'app-calendar-block',
  templateUrl: './calendar-block.component.html',
  styleUrls: ['./calendar-block.component.sass']
})
export class CalendarBlockComponent implements OnInit {

  @Input() inputDoctorInfo: UserDoctor;
  @Input() isEditPage: boolean;
  @Input() calendarUserId: string;
  @Input() isInProfileModule: string;
  
  selectedDay = -1 //номер дня (-1\ 1-31)
  day = new Date().getDate()
  month = new Date().getMonth() + 1 //меняется при листании календаря
  currentMonth = new Date().getMonth() + 1 //1 = январь, 12 = декабрь (не меняется)
  year = new Date().getFullYear() //меняется при листании календаря
  currentYear = new Date().getFullYear() //не меняется при листании
  daysArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
  currentDays: number
  monthsNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"]
  monthName = ""
  daysOfWeek = ["Пн", "Вт", "Ср", "Чт", "Пн", "Сб", "Вс"]
  currentFirstDay: number
  selectedHourForLesson = -1 //выбранное клиентом время записи (8-22 часа)
  updatingdWorkHourData = false //чтобы при каждом клике подряд не скачивать инфу
  workStart = 8
  workEnd = 22
  workHoursArray = []
  doctorShedule = {}

  constructor(
    private firebase: FirebaseService,
    private popupService: PopupService,
    private router: Router,
    private auth: AuthService,
    private userData: UserData
  ) { }

  ngOnInit(): void {
    this.setMonthName()
    this.showDays()
    this.makeHoursArray()
    this.downloadSheduleInfo()
  }

  downloadSheduleInfo() {
    this.firebase.getDoctorShedule(this.calendarUserId)
    .subscribe((resp) => {
      console.log("расписание доктора скачано: ", resp);
      this.doctorShedule = resp
    },
    (err) => {
      console.log("ошибка при скачивании расписании доктора: ", err);
    })
  }

  makeHoursArray() {
    for (let i = this.workStart; i <= this.workEnd; i++) { 
      this.workHoursArray.push(i) //массив всех часов для html ngFor
      // this.selectedDayHoursSettings[i] = {"workTime": false}
    }
  }


  increaseMonth() {
    this.selectedDay = -1 //сброс дня
    this.month++
    if (this.month == 13) {
      this.month = 1
      this.year++
    }
    this.setMonthName()
    this.showDays()
  }
  decreaseMonth() {
    this.selectedDay = -1 //сброс дня
    this.month--
    if (this.month == 0) {
      this.month = 12
      this.year--
    }
    this.setMonthName()
    this.showDays()
  }

  setMonthName() {
    this.monthName = this.monthsNames[this.month - 1]
  }

  showDays() {
    let m = this.month
    let y = this.year
    let days = new Date(y, m, 0).getDate()

    this.currentDays = days 
    this.daysArr = [] //массив дней от 0 до 30 например
    for(let i = 1; i <= days; i++) this.daysArr.push(i);
    // console.log(this.daysArr);
    
    this.getFirstDayOfWeek();
    // (<HTMLElement>document.querySelector(".day")).style.marginLeft = "30px"
  }

  getFirstDayOfWeek () { //возвращает 1-7 (Пн-Вс)
    let firstDay = new Date(this.year, this.month - 1, 1)
    // console.log(firstDay);
    if (firstDay.getDay() == 0) {
      this.currentFirstDay = 7
      return
    }
    this.currentFirstDay = firstDay.getDay() // т.к. помоешная нумерация (Вс = 0, Пн = 1...)
    return 
  }

  onDayClick(dayIndex) { //номер дня (1-31)
    console.log(this.year, this.month, dayIndex);
    this.selectedDay = dayIndex - 1

  }

  onOutDay(dayOfWeekChoosen) { //ouput из отдельного дня
    console.log("выбран ", dayOfWeekChoosen);
  }

  onClickTimeRow(lessonTime) {
    // console.log(lessonTime);
    if (this.isEditPage) {         //для страницы редактирования своего календаря
      let hourSettings = {workTime: true, isEngaged: false}
      if (this.doctorShedule && //если час уже настроен (включен), то выключить его
          this.doctorShedule[this.year] &&
          this.doctorShedule[this.year][this.month] && 
          this.doctorShedule[this.year][this.month][this.selectedDay+1] && 
          this.doctorShedule[this.year][this.month][this.selectedDay+1][lessonTime]) {
          // hourSettings["workTime"] = !this.doctorShedule[this.year][this.month][this.selectedDay+1][lessonTime]["workTime"]
          delete hourSettings["workTime"]
          delete hourSettings["isEngaged"]
      }
      this.firebase.changeWorkHourBoolean(this.calendarUserId ,this.year, this.month, this.selectedDay+1, lessonTime, hourSettings)
      .subscribe((resp) => {
        // console.log("все пользователи: ", resp);
        console.log("этот час теперь рабочий");
        this.updateLocalsheduleData()
      },
      (err) => {
        console.log("ошибка при изменении рабочего часа ", err);
      })
    } else if (!this.isEditPage) {       //для страницы просмотра и записи к доктору например
      if (this.doctorShedule[this.year][this.month][this.selectedDay+1][lessonTime]) 
      this.selectedHourForLesson = lessonTime
    }
  }

  updateLocalsheduleData() { //обновление инфы по часам (отправка по клику, а скачивание не чаще заданного интервала)
    if (!this.updatingdWorkHourData) {
      this.updatingdWorkHourData = true
      setTimeout((function() { 
        this.downloadSheduleInfo()
        this.updatingdWorkHourData = false
      }).bind(this), 1500) //интервал = 1.5 сек, после которого начинается скачка
    }
    
    
  }

  makeAnAppointment(year, month, day, hour) { 
    if (this.auth.isAuthenticated()) {

      const timeData = {
        year: year,
        month: month,
        day: day,
        hour: hour
      }

      const doctorData = {
        id: this.calendarUserId
      }

      const clientData = {
        id: localStorage.getItem("user-Id"),
        name: `${this.userData.myData.name} ${this.userData.myData.surname}`,
        description: "описание проблемы...",
      }

      
      this.firebase.makeALesson(timeData, doctorData, clientData)
      .subscribe((resp)=>{
        console.log("клиент записан: ", resp);
      },
      (err) => {
        console.log("ошибка записи к доктору: ", err);
      })
      // console.log(`запись: \n клиент: ${year} ${month} ${day} ${hour} \n ${clientData.name} \n ${clientData.id} \n доктор:`);
    } else {
      console.log("надо залогиниться!");
      this.popupService.toggleLoginPopup()
      this.router.navigate(["/"], {
        queryParams: {
            needLoginToMakeAnAppointment: true
        }
      })
    }
  }

}
