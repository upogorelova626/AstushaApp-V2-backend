import { IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateProjectRepositoryDto {
  @IsString()
  @IsUrl(
    {
      require_protocol: false,
    },
    {
      message: 'Введите корректную ссылку на репозиторий',
    },
  )
  @MaxLength(500)
  url!: string;
}
