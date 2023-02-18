import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common'
import { CreateReportDto } from './dtos/create-report.dto'
import { ReportsService } from './reports.service'
import { AuthGuard } from '../guards/auth.guard'
import { AdminGuard } from '../guards/admin.guard'
import { CurrentUser } from '../users/decorators/current-user.decorator'
import { User } from '../users/user.entity'
import { ReportDto } from './dtos/report.dto'
import { Serialize } from '../interceptors/serialize.interceptor'
import { ApproveReportDto } from './dtos/approve-report.dto'
import { GetEstimateDto } from './dtos/get-estimate.dto'

@Controller('reports')
export class ReportsController {
  constructor(
    private reportsService: ReportsService
  ) { }

  @Get()
  getEstimate(@Query() query: GetEstimateDto) {
    return this.reportsService.createEstimate(query)
  }

  @Post()
  @UseGuards(AuthGuard)
  @Serialize(ReportDto)
  createReport(@CurrentUser() user: User, @Body() body: CreateReportDto) {
    return this.reportsService.create(user, body)
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  approveReport(@Param('id') id: string, @Body() body: ApproveReportDto) {
    return this.reportsService.changeApproval(parseInt(id), body.approved)
  }
}
