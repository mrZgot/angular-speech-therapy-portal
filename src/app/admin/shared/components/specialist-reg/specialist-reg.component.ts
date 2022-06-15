import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { DevelopHelp } from 'src/app/shared/services/develop-help.service';
import { FirebaseService } from 'src/app/shared/services/firebase.service';
import { PopupService } from 'src/app/shared/services/popup.service';

@Component({
  selector: 'app-specialist-reg',
  templateUrl: './specialist-reg.component.html',
  styleUrls: ['./specialist-reg.component.sass']
})
export class SpecialistRegComponent implements OnInit {

  newUniqId = null
  passwordMinLength = 6
  doctorRegistrationForm: FormGroup
  isSendingData = false
  showSuccessReg = ""
  showRulesRequired = false
  reloginErrorMessage = ""
  shortIdErrorMessage = ""
  serverErrMessage = ""
  registrationStatus = ""
  createDBStatus = ""

  TESTFB = {
    email: "vlatidos@gmail.com",
    emailVerified: false,
    name: "Владислав",
    newsSubscription: false,
    patronymic: "Витальевич",
    surname: "Демидов",
    userType: "doctor",
  }


  constructor(
    private auth: AuthService,
    private helper: DevelopHelp,
    public popupService: PopupService,
    private firebase: FirebaseService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.generateUniqueUserId()

    this.doctorRegistrationForm = new FormGroup({
      name: new FormControl("Владислав",
        Validators.required),
      surname: new FormControl("Демидов",
        Validators.required),
      patronymic: new FormControl("Витальевич",
        Validators.required),
      // university: new FormControl(null),
      // faculty: new FormControl(null),
      // year: new FormControl(null),
      // experience: new FormControl(null),
      // workPlace: new FormControl(null),
      // documents: new FormControl(null),
      email: new FormControl("vlatidos@gmail.com", [
        Validators.required,
        Validators.email
      ]),
      password: new FormControl("123456", [
        Validators.required,
        Validators.minLength(this.passwordMinLength)
      ]),
      // passwordRepeat: new FormControl(null),
      termsOfUse: new FormControl(true, [
        Validators.required,
        Validators.requiredTrue
      ]),
      newsSubscription: new FormControl(false),


    })
  }


  sendDoctorForm() {
    this.isSendingData = true
    this.registrationStatus = ""
    this.shortIdErrorMessage = ""
    this.createDBStatus = ""
    this.reloginErrorMessage = ""
    
    if (this.doctorRegistrationForm.invalid || !this.newUniqId || !this.firebase.getCurrentUser) {
      this.isSendingData = false
      if (!this.newUniqId || !this.firebase.getCurrentUser) {
        this.reloginErrorMessage = "❌ для регистрации нового пациента (если подряд 2 и более) надо перелогиниться в админку (баг)"
      }
      return
    }

    const newDoctorData = {
      name: this.doctorRegistrationForm.value.name,
      surname: this.doctorRegistrationForm.value.surname,
      patronymic: this.doctorRegistrationForm.value.patronymic,
      email: this.doctorRegistrationForm.value.email.trim(), 
      newsSubscription: this.doctorRegistrationForm.value.newsSubscription,
      userType: "doctor",
      emailVerified: false,
      shortId: this.newUniqId
    }

    
    if (!this.newUniqId) {
      this.shortIdErrorMessage = "❌ короткий id не может быть создан.."
      this.isSendingData = false
      return
    }

    const registrationData = {
      email: this.doctorRegistrationForm.value.email.trim(),
      password: this.doctorRegistrationForm.value.password.trim(),
    }

    this.firebase.registrNewUser(registrationData)
    .then((res) => {

      console.log("пользователь зарегистрирован: ", res)
      this.registrationStatus = "✔️пользователь зарегистрирован, ждем создания ячейки БД..."
      
      this.firebase.createNewUserDBbyAdmin(res.user.uid, newDoctorData).subscribe(() => {
        this.patchShortIdData(newDoctorData.shortId, res.user.uid) 
        this.isSendingData = false
        this.helper.toConsole("объект доктора создан")
        this.createDBStatus = "✔️ячейка базы данных создана, пользователь полностью готов"
        this.reloginErrorMessage = "❌✔️ Готово. Но чтобы продолжить работать в админке надо перелогиниться опять."
        this.doctorRegistrationForm.reset()
        // this.router.navigate(['/profile'])
      }, (err) => {
        this.isSendingData = false
        this.createDBStatus = "❌Ошибка создания ячейки данных"
        console.log("Ошибка создания ячейки данных: ", err);
      })



    },(err) => {
      this.isSendingData = false
      console.log("Ошибка регистрации: ", err.code, err);
      this.errorHandler(err.code)
    })
    .catch((err) => {
      console.log("Ошибка регистрации ")
    })

  }

  patchShortIdData(newShortId, longId) {
    const newData = {
      [longId]: newShortId
    }

    this.firebase.updateData("shortIds", newData)
      .then((resp) => {
        console.log("ура")
        this.shortIdErrorMessage = "✔️shortId успешно записан"
        })
      .catch((err) => {
        console.log("err: ", err)
        this.shortIdErrorMessage = "❌shortId не удалось записать, требуется ручная запись в базу данных!"
      })
      .finally(() => {
        this.newUniqId = ""
      })

  }

  

  TESTFbMakeDBuser() {
    this.firebase.TESTcreateNewUserDataObject("gTysN0EOxcSYBKNVgZOp8jsuwgh2", this.TESTFB).subscribe((resp) => {
      console.log("удачно: ", resp)
    },
    (err) => {
      console.log("неудачно: ", err)
    })
  }

  TESTgetToken() {
    console.log(this.firebase.getUserToken())
  }

  generateUID() {
    let firstPart: string|number = (Math.random() * 46656) | 0;
    let secondPart: string|number = (Math.random() * 46656) | 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-3);
    secondPart = ("000" + secondPart.toString(36)).slice(-3);
    // console.log(firstPart + secondPart)
    return firstPart + secondPart
  }

  generateUniqueUserId() {
    const checkUser = setInterval(() => {
      // console.log(this.firebase.currentUser) 
      if (this.firebase.shortIds) {
        // console.log(this.generateUID()) 
        let uniqueIdCreated = false
        let counter = 0
        while(!uniqueIdCreated && counter < 10) {
          const newId = this.generateUID()
          console.log(newId)
          if (this.checkNewId(newId)) {
            console.log("shortId: ", newId)
            uniqueIdCreated = true
            this.newUniqId = newId
          }
          counter++
        }
        clearInterval(checkUser)
      } else {console.log("no FB _shortIds")}
    }, 200)
  }

  checkNewId(newId) {
    // return false
    return !Object.values(this.firebase.shortIds).includes(newId)
  }

  errorHandler(error) {
    console.log("в обработчик пришло: ", error);
    switch (error) {
      case "auth/email-already-in-use":
        this.serverErrMessage = "Эта почта уже используется!"
        break
      default: 
      this.serverErrMessage = `Неизвестная ошибка при регистрации: ${error}`
        break
    }
  }

}
