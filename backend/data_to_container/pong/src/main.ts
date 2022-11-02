import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import * as fs from 'fs';

var HttpsOptions: HttpsOptions = {
	key: fs.readFileSync('.pong.key'),
	cert: fs.readFileSync('pong.csr')
}

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		cors: {
			// origin: "*",
			origin: [process.env.REACT_APP_FRONT_URL,
				"https://signin.intra.42.fr",
				"https://api.intra.42.fr"
			],
			// methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
			credentials: true,
			methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
			preflightContinue: true,
			optionsSuccessStatus: 204,

		},
		httpsOptions: HttpsOptions
	});

	const config = new DocumentBuilder()
		.setTitle('Transcendence')
		.setDescription('The Transcendence API description')
		.setVersion('1.0')
		.addTag('match')
		.addTag('user')
		.addTag('pong')
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	app.use(cookieParser());
	await app.listen(process.env.BACK_PORT);
}
bootstrap();
