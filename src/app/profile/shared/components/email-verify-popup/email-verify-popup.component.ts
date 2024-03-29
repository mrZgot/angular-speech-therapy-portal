import { Component, OnInit, Input} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { FirebaseService } from 'src/app/shared/services/firebase.service';
import { PopupService } from 'src/app/shared/services/popup.service';
import { UserData } from '../../services/user-data.service';

@Component({
  selector: 'app-email-verify-popup',
  templateUrl: './email-verify-popup.component.html',
  styleUrls: ['./email-verify-popup.component.sass']
})
export class EmailVerifyPopupComponent implements OnInit {

  @Input() emailSendSuccess = -1

  constructor(
    public popupService: PopupService,
    private auth: AuthService,
    private firebase: FirebaseService,
    private userData: UserData,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    // this.sendEmailVerification()
    // this.checkQuerry()
    // this.firebase.userObserver()
  }

  logName() {
    console.log( this.userData.myData.name)
  }

  checkQuerry() {
    // this.activatedRoute.queryParams.subscribe((params: Params) => {
    //   console.log("PARAMS:", params );
    //   if (params["oobCode"] ) {
    //     // setInterval(this.checkCurrentUser(), 500)
    //     let timerCheckAuthentication = setInterval(() => {
    //       const isAuthenticated = this.checkCurrentUser()
    //       if (isAuthenticated) {
    //         clearInterval(timerCheckAuthentication)
    //         this.firebase.applyActionCode(params["oobCode"])
    //       }
    //     }, 500);
    //   } 
    // })
  }


  checkCurrentUser() {
    return this.firebase.isAuthenticated()
  }

  changeEmailVerifyBoolean() {
    console.log("changeEmailVerifyBoolean changeEmailVerifyBoolean");
  }

  testEmail() {
    console.log("test email")
    this.firebase.sendVerificationEmail()
      .then((resp) => {
        this.emailSendSuccess = 1
        console.log("письмо отправлено: ", resp)
      })
      .catch((err) => {
        this.emailSendSuccess = 0
        console.log("ошибка отправления письма: ", err)
    })
  }
  // sendEmailVerification() {
  //   const email = this.userData.myData.email
  //   console.log(`отправка письма для подтверждения на почту ${email}`);
  //   this.firebase.sendVerificationEmail(email)
  //     .then(() => {
  //       console.log("письмо отправлено на имеил");
  //     })
  //     .catch((err) => {
  //       console.log("ошибка отправки письма для верификации: ", err);
  //     })
  // }

  logOut() {
    // this.auth.logout()
    this.firebase.signOut()
      .then(() => {
        console.log("user signed out");
      })
      .catch((err) => {
        console.log("user sign out ERROR: ", err);
      })
  }

  pageReload() {
    location.reload()
  }

}
function input() {
  throw new Error('Function not implemented.');
}

