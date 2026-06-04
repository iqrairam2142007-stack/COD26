import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('renders both direct student and school code student options', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /student login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /direct student/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /school code student/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/student name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/registered email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/school \/ college/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/class/i)).not.toBeInTheDocument();
  });

  test('direct student must enter a transaction id before unlocking the course', async () => {
    render(<App />);

    await userEvent.click(screen.getAllByRole('button', { name: /create account/i })[0]);
    await userEvent.type(screen.getByLabelText(/student name/i), 'Iqra');
    await userEvent.type(screen.getByLabelText(/username/i), 'iqra01');
    await userEvent.type(screen.getByLabelText(/registered email/i), 'iqra@example.com');
    await userEvent.type(screen.getByLabelText(/school \/ college/i), 'Victoria College');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'secure-pass');
    await userEvent.click(screen.getAllByRole('button', { name: /^create account$/i })[1]);

    expect(
      screen.getByRole('heading', { name: /₹299 per month for 6 months/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/transaction id/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /unlock course for/i })
    ).toBeDisabled();
  });

  test('admin can create a school code and a school student can access without payment', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /admin login/i }));
    await userEvent.type(screen.getByLabelText(/admin email/i), 'officialcod70@gmail.com');
    await userEvent.type(screen.getByLabelText(/admin password/i), 'victoria@786');
    await userEvent.click(screen.getByRole('button', { name: /login as admin/i }));

    await userEvent.click(screen.getByRole('button', { name: /school codes/i }));
    await userEvent.type(screen.getByLabelText(/school name/i), 'Victoria School');
    await userEvent.type(screen.getByLabelText(/^school code$/i), 'SCH-101');
    await userEvent.click(screen.getByRole('button', { name: /create school code/i }));
    expect(screen.getByText(/victoria school/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /log out/i }));
    await userEvent.click(screen.getByRole('button', { name: /school code student/i }));
    await userEvent.click(screen.getAllByRole('button', { name: /create account/i })[0]);
    await userEvent.type(screen.getByLabelText(/student name/i), 'Riya');
    await userEvent.type(screen.getByLabelText(/username/i), 'riya01');
    await userEvent.type(screen.getByLabelText(/registered email/i), 'riya@example.com');
    await userEvent.type(screen.getByLabelText(/school \/ college/i), 'Victoria School');
    await userEvent.type(screen.getByLabelText(/student id/i), 'STU-1');
    await userEvent.type(screen.getByLabelText(/^school code$/i), 'SCH-101');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'school-pass');
    await userEvent.click(screen.getAllByRole('button', { name: /^create account$/i })[1]);

    expect(screen.getByText(/partner school \/ college access/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /₹299 per month for 6 months/i })).not.toBeInTheDocument();
  });
});
