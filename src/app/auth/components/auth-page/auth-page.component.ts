import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LoginComponent } from "../login/login.component";
import { RegisterComponent } from "../register/register.component";

@Component({
  selector: "app-auth-page",
  standalone: true,
  imports: [CommonModule, LoginComponent, RegisterComponent],
  templateUrl: "./auth-page.component.html",
  styleUrls: ["./auth-page.component.scss"],
})
export class AuthPageComponent {
  public showLogin: boolean = true;

  toggleForm(): void {
    this.showLogin = !this.showLogin;
  }
}
