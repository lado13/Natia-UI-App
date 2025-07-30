import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NatiaComponent } from './natia.component';

describe('NatiaComponent', () => {
  let component: NatiaComponent;
  let fixture: ComponentFixture<NatiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NatiaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NatiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
