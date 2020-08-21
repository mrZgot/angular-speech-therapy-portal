import { Component, OnInit } from '@angular/core';
import { PopupService } from '../../services/popup.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { DevelopHelp } from '../../services/develop-help.service';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-login-popup',
  templateUrl: './login-popup.component.html',
  styleUrls: ['./login-popup.component.sass']
})
export class LoginPopupComponent implements OnInit {

  loggingIn = false
  form: FormGroup
  passwordMinLength = 6
  serverErrMessage = ""
  accessErrMessage = ""

  constructor(
    private firebase: FirebaseService,
    private helper: DevelopHelp,
    public popupService: PopupService,
    private authServise: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
    ) { }

  ngOnInit(): void {

    this.activatedRoute.queryParams.subscribe((params: Params) => {
      if (params["needLogin"]) {
        this.accessErrMessage = "Для доступа к профилю необходимо войти в аккаунт"
      }
    })

    this.form = new FormGroup({
      email: new FormControl(null, [
        Validators.required,
        Validators.email
      ]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(this.passwordMinLength)
      ])
    })
  }

  logIn() {
    if (this.form.invalid) {
      return
    }

    const user = {
      email: this.form.value.email,
      password: this.form.value.password,
    }
    this.loggingIn = true
    
    // this.firebase.signInWithPass(user)
    //   .then((result) => {
    //     console.log(result);
    //     console.log("вход вроде выполнен");
    //     this.loggingIn = false
    //   })
    //   .catch((err) => {
    //     this.loggingIn = false
    //     console.log("ошибка входа чз firebase: ", err);
    //   })
    
    this.authServise.login(user).subscribe((response) => {
      this.form.reset()
      this.loggingIn = false
      this.popupService.toggleLoginPopup()
      this.helper.toConsole("При входе был получен ответ: ",response)
      this.router.navigate(['/profile'])

    },
    (err)=> {
      console.log("ERROR:", err);
      this.loginErrorHandler(err)
      this.loggingIn = false
      
    })
  }  

  loginErrorHandler(error) {
    this.helper.toConsole("в обработчик пришло: ", error);
    switch (error.error.error.message) {
      case "EMAIL_NOT_FOUND":
        this.serverErrMessage = "Такая почта не найдена"
        break
      case "INVALID_PASSWORD":
        this.serverErrMessage = "Неверный пароль"
        break
      default: 
      this.serverErrMessage = error.error.error.message
        break
    }
  }

}