import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User } from '../users/user.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  async findAll(): Promise<Event[]> {
    return this.eventsRepository.find({
      relations: ['participants'],
    });
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['participants'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async create(createEventDto: CreateEventDto, user: User): Promise<Event> {
    const event = this.eventsRepository.create({
      ...createEventDto,
      date: new Date(createEventDto.date),
      createdBy: user,
      participants: [],
    });

    return this.eventsRepository.save(event);
  }

  async update(id: number, updateEventDto: UpdateEventDto, user: User): Promise<Event> {
    const event = await this.findOne(id);

    // Проверяем, является ли пользователь создателем события
    if (event.createdBy.id !== user.id) {
      throw new UnauthorizedException('You can only update your own events');
    }

    // Обновляем поля события
    Object.assign(event, {
      ...updateEventDto,
      date: updateEventDto.date ? new Date(updateEventDto.date) : event.date,
    });

    return this.eventsRepository.save(event);
  }

  async remove(id: number, user: User): Promise<void> {
    const event = await this.findOne(id);

    // Проверяем, является ли пользователь создателем события
    if (event.createdBy.id !== user.id) {
      throw new UnauthorizedException('You can only delete your own events');
    }

    await this.eventsRepository.remove(event);
  }

  async register(id: number, user: User): Promise<Event> {
    const event = await this.findOne(id);

    // Проверяем, не зарегистрирован ли пользователь уже
    const isRegistered = event.participants.some(participant => participant.id === user.id);

    if (!isRegistered) {
      event.participants.push(user);
      return this.eventsRepository.save(event);
    }

    return event;
  }

  async cancelRegistration(id: number, user: User): Promise<Event> {
    const event = await this.findOne(id);

    // Удаляем пользователя из списка участников
    event.participants = event.participants.filter(participant => participant.id !== user.id);

    return this.eventsRepository.save(event);
  }

  async findUserEvents(user: User): Promise<Event[]> {
    // Находим события, созданные пользователем
    const createdEvents = await this.eventsRepository.find({
      where: { createdBy: { id: user.id } },
      relations: ['participants'],
    });

    // Находим события, в которых пользователь участвует
    const participatingEvents = await this.eventsRepository
      .createQueryBuilder('event')
      .innerJoinAndSelect('event.participants', 'participant')
      .where('participant.id = :userId', { userId: user.id })
      .leftJoinAndSelect('event.createdBy', 'createdBy')
      .leftJoinAndSelect('event.participants', 'allParticipants')
      .getMany();

    // Объединяем результаты и удаляем дубликаты
    const allEvents = [...createdEvents];
    
    for (const event of participatingEvents) {
      if (!allEvents.some(e => e.id === event.id)) {
        allEvents.push(event);
      }
    }

    return allEvents;
  }
} 