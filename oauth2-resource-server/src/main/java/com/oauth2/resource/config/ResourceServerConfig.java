package com.oauth2.resource.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * 资源服务器安全配置
 *
 * 【核心概念】资源服务器如何验证 token？
 *
 * 方式一：每次请求都去授权服务器验证（INTROSPECTION）—— 性能差
 * 方式二：用 JWT（推荐）—— 资源服务器自己就能验证，不用找授权服务器
 *
 * 我们用 JWT 方式：
 * 1. 授权服务器用私钥签发 JWT token
 * 2. 资源服务器从授权服务器的 JWKS 端点获取公钥
 * 3. 资源服务器用公钥验证 JWT 签名，确保 token 没被篡改
 *
 * 所以你看到下面配置了 jwt().jwkSetUri(...) 就是指向授权服务器的公钥端点。
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // 启用 @PreAuthorize 等注解
public class ResourceServerConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 无状态会话，每次请求都靠 token 认证
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(authorize -> authorize
                // /api/public/** 公开接口，不需要 token
                .requestMatchers("/api/public/**").permitAll()
                // /api/admin/** 需要 ADMIN 角色
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // 其他接口需要认证（有合法 token 即可）
                .anyRequest().authenticated()
            )
            // 配置 JWT 验证，从授权服务器获取公钥
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> {})  // JWT 配置在 application.yml 中指定 jwk-set-uri
            );

        return http.build();
    }
}
