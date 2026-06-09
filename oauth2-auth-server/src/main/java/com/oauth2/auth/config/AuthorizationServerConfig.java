package com.oauth2.auth.config;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Duration;
import java.util.List;
import java.util.UUID;

/**
 * 授权服务器核心配置
 *
 * ============================================================
 * OAuth2.0 四种授权模式快速理解：
 * ============================================================
 *
 * 1. 授权码模式（authorization_code）—— 最安全，生产环境首选
 *    适用场景：有后端的 Web 应用
 *    流程：用户跳转到授权页 -> 同意授权 -> 拿到 code -> 后端用 code 换 token
 *    特点：token 不会暴露给浏览器，code 只能用一次且有效期很短
 *
 * 2. 密码模式（password）—— 简单但已不推荐
 *    适用场景：高度信任的第一方应用（比如自家的 App）
 *    流程：用户直接把账号密码给客户端，客户端拿着去换 token
 *    特点：密码会暴露给客户端，安全风险高
 *
 * 3. 客户端模式（client_credentials）—— 机器对机器
 *    适用场景：微服务之间调用，没有"用户"参与
 *    流程：用 client_id + client_secret 直接换 token
 *    特点：不涉及用户登录，只验证客户端身份
 *
 * 4. 简化模式（implicit）—— 已废弃
 *    适用场景：纯前端 SPA（历史遗留）
 *    流程：直接在回调 URL 的 hash 里返回 token
 *    特点：token 暴露在 URL 中，不安全，已被 OAuth2.1 废弃
 *    注意：新版 Spring Authorization Server 已不支持此模式
 * ============================================================
 */
@Configuration
@EnableWebSecurity
public class AuthorizationServerConfig {

    /**
     * 【核心 Bean】注册客户端信息
     *
     * 这里配置了两个客户端，分别演示不同场景：
     * - web-app：演示授权码模式
     * - server-app：演示客户端模式
     *
     * 你可以把 RegisteredClient 理解为"接入应用"的账号，
     * 每个想接入 OAuth2.0 的应用都需要先在这里注册。
     */
    @Bean
    public RegisteredClientRepository registeredClientRepository(PasswordEncoder passwordEncoder) {
        // ---- 客户端1：web-app（授权码模式 + 密码模式） ----
        // 模拟一个 Web 应用，用户通过浏览器登录
        RegisteredClient webAppClient = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("web-app")                          // 客户端 ID，相当于"应用账号"
                .clientSecret(passwordEncoder.encode("secret")) // 客户端密钥，相当于"应用密码"
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC) // 用 Basic 认证
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE) // 支持授权码模式
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)      // 支持刷新 token
                .authorizationGrantType(AuthorizationGrantType.PASSWORD)           // 支持密码模式（学习用）
                .redirectUri("http://127.0.0.1:5173/callback")  // 授权后的回调地址
                .scope(OidcScopes.OPENID)                      // OIDC 范围
                .scope("read")                                 // 自定义 scope：读权限
                .scope("write")                                // 自定义 scope：写权限
                .clientSettings(ClientSettings.builder()
                        .requireAuthorizationConsent(true)       // 需要用户确认授权页面
                        .requireProofKey(false)                  // 不需要 PKCE（学习阶段简化）
                        .build())
                .tokenSettings(TokenSettings.builder()
                        .accessTokenTimeToLive(Duration.ofHours(1))   // access_token 有效期 1 小时
                        .refreshTokenTimeToLive(Duration.ofDays(7))   // refresh_token 有效期 7 天
                        .build())
                .build();

        // ---- 客户端2：server-app（客户端模式） ----
        // 模拟一个后端服务，不涉及用户登录
        RegisteredClient serverAppClient = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("server-app")
                .clientSecret(passwordEncoder.encode("server-secret"))
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS) // 客户端模式
                .scope("read")
                .scope("write")
                .tokenSettings(TokenSettings.builder()
                        .accessTokenTimeToLive(Duration.ofHours(1))
                        .build())
                .build();

        return new InMemoryRegisteredClientRepository(webAppClient, serverAppClient);
    }

    /**
     * 用户信息
     *
     * 这里用内存存储两个测试用户，实际项目会用数据库。
     * 密码都是用 BCrypt 加密的。
     */
    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder passwordEncoder) {
        UserDetails user = User.builder()
                .username("zhangsan")
                .password(passwordEncoder.encode("123456"))
                .roles("USER")
                .build();

        UserDetails admin = User.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .roles("USER", "ADMIN")
                .build();

        return new InMemoryUserDetailsManager(user, admin);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * RSA 密钥对，用于签发和验证 JWT
     *
     * JWT（JSON Web Token）需要用非对称加密来签名：
     * - 授权服务器用私钥签名 token
     * - 资源服务器用公钥验证 token
     *
     * 这样资源服务器不需要跟授权服务器通信就能验证 token 的真伪。
     */
    @Bean
    public JWKSource<SecurityContext> jwkSource() {
        KeyPair keyPair = generateRsaKey();
        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
        RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();
        RSAKey rsaKey = new RSAKey.Builder(publicKey)
                .privateKey(privateKey)
                .keyID(UUID.randomUUID().toString())
                .build();
        JWKSet jwkSet = new JWKSet(rsaKey);
        return new ImmutableJWKSet<>(jwkSet);
    }

    private static KeyPair generateRsaKey() {
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            return keyPairGenerator.generateKeyPair();
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }

    @Bean
    public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
        return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);
    }

    /**
     * 授权服务器安全过滤链（优先级最高）
     *
     * 这条链处理所有 OAuth2.0 协议相关的端点：
     * - /oauth2/authorize   授权端点（用户点击"同意授权"的地方）
     * - /oauth2/token       Token 端点（用 code 换 token 的地方）
     * - /oauth2/jwks        JWKS 端点（公钥，资源服务器用来验证 JWT）
     * - /userinfo           用户信息端点
     */
    @Bean
    @Order(1)
    public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http) throws Exception {
        OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(http);

        http.getConfigurer(OAuth2AuthorizationServerConfigurer.class)
                .oidc(Customizer.withDefaults()) // 启用 OIDC（OpenID Connect）
                // 自定义授权确认页面
                .authorizationEndpoint(endpoint -> endpoint
                        .consentPage("/oauth2/consent")
                );

        // 未登录时跳转到登录页
        http.exceptionHandling(exceptions -> exceptions
                .defaultAuthenticationEntryPointFor(
                        new LoginUrlAuthenticationEntryPoint("/login"),
                        new MediaTypeRequestMatcher(MediaType.TEXT_HTML)
                )
        );

        return http.build();
    }

    /**
     * 普通 Web 安全过滤链（登录页等）
     */
    @Bean
    @Order(2)
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())  // 启用 CORS
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/login", "/css/**", "/error").permitAll()
                // 放行 Chrome DevTools 等浏览器的后台请求，避免登录后被劫持重定向
                .requestMatchers("/.well-known/**").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")  // 自定义登录页
                // 登录成功后默认跳转首页，避免被浏览器后台请求缓存导致重定向到奇怪的地址
                .defaultSuccessUrl("/", true)
            );

        return http.build();
    }

    /**
     * 授权服务器设置
     *
     * 这里配置授权服务器对外发布的 URL，本地学习直接用 localhost。
     */
    @Bean
    public AuthorizationServerSettings authorizationServerSettings() {
        return AuthorizationServerSettings.builder()
                .issuer("http://localhost:9000")  // 签发者地址
                .build();
    }

    /**
     * CORS 配置 —— 允许前端跨域访问
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://127.0.0.1:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
