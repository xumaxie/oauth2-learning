package com.oauth2.resource;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 资源服务器启动类
 *
 * 这个服务的职责：
 * 1. 提供 API 资源（用户信息、订单数据等）
 * 2. 验证请求中的 JWT token 是否合法
 * 3. 根据 scope 和 role 控制访问权限
 *
 * 端口：8090
 */
@SpringBootApplication
public class ResourceServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ResourceServerApplication.class, args);
    }
}
