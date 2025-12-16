package com.incial.crm.config;

import com.incial.crm.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${spring.profiles.active:local}")
    private String activeProfile;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()

                        .requestMatchers("/api/v1/crm/**").hasAnyAuthority(
                                "ROLE_ADMIN", "ROLE_EMPLOYEE", "ROLE_SUPER_ADMIN"
                        )
                        .requestMatchers("/api/v1/tasks/**").hasAnyAuthority(
                                "ROLE_ADMIN", "ROLE_EMPLOYEE", "ROLE_SUPER_ADMIN"
                        )
                        .requestMatchers("/api/v1/meetings/**").hasAnyAuthority(
                                "ROLE_ADMIN", "ROLE_EMPLOYEE", "ROLE_SUPER_ADMIN"
                        )
                        .requestMatchers("/api/v1/users/**").hasAnyAuthority(
                                "ROLE_ADMIN", "ROLE_EMPLOYEE", "ROLE_SUPER_ADMIN"
                        )

                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        // Environment-based CORS configuration
        // SECURITY: Local network patterns are ONLY enabled when profile != "production"
        // To enable production security, set: SPRING_PROFILES_ACTIVE=production
        List<String> allowedOrigins = new ArrayList<>();

        // Always allow production domain
        allowedOrigins.add("https://work-hub-eight.vercel.app");

        // Only allow local/development origins in non-production environments
        // WARNING: These patterns allow ANY device on local networks - DO NOT use in production!
        if (!"production".equalsIgnoreCase(activeProfile)) {
            allowedOrigins.add("http://localhost:*");
            allowedOrigins.add("http://127.0.0.1:*");
            allowedOrigins.add("http://192.168.*.*:*");  // Local network - REMOVED in production
            allowedOrigins.add("http://10.*.*.*:*");     // Private network - REMOVED in production
        }

        config.setAllowedOriginPatterns(allowedOrigins);

        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));

        config.setAllowedHeaders(List.of(
                "Authorization", "Content-Type"
        ));

        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}