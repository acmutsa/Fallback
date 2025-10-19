// TODO(https://github.com/acmutsa/Fallback/issues/13): Implement proper error logging here and an appropriate display for some common errors
/// @ts-expect-error - remove after above bug complete
export default function ErrorComponent({ errorToLog }: { errorToLog: Error }) {
	return (
		<div>
			Uh oh. An unrecoverale error has occured. Please refresh the page.
		</div>
	);
}