package com.oauth2.auth.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 登录页控制器
 *
 * 提供 /login GET 请求，返回自定义的登录页面。
 * Thymeleaf 会自动找 templates/login.html。
 */
@Controller
public class LoginController {

    @GetMapping("/login")
    public String login() {
        return "login";
    }
}
