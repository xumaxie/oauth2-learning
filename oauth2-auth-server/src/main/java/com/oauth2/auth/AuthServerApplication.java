package com.oauth2.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 授权服务器启动类
 *
 * 这个服务的职责：
 * 1. 管理客户端信息（client_id, client_secret, 支持的授权模式等）
 * 2. 管理用户信息（用户名、密码、角色等）
 * 3. 处理授权请求，颁发 access_token
 *
 * 端口：9000
 */
@SpringBootApplication
public class AuthServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(AuthServerApplication.class, args);
    }
}
