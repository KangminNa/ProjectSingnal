import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ZodValidationPipe } from '@api/zod-validation.pipe';
import { JwtAuthGuard } from '@api/guards/jwt-auth.guard';
import { CurrentUser } from '@api/decorators/current-user.decorator';
import { AuthCommandService } from './auth-command.service';
import { AuthQueryService } from './auth-query.service';
import { SignupSchema, SignupDto } from './dto/signup.dto';
import { LoginSchema, LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authCommand: AuthCommandService,
    private readonly authQuery: AuthQueryService,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  async signup(@Body(new ZodValidationPipe(SignupSchema)) dto: SignupDto) {
    return this.authCommand.signup(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto) {
    return this.authCommand.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.authQuery.getProfile(userId);
  }
}
